//making a HTMLcanvas with ref hook
import { useRef, useState, useEffect } from "react"
import { SWATCHES } from "@/constants"
import { ColorSwatch, Group } from "@mantine/core"
import { Button } from "@mantine/core"
import axios from "axios"
import { IconSun, IconMoon } from "@tabler/icons-react"



interface ApiResponse {
    expr: string;
    result: any;
    assign: boolean; // Fixed the typo from 'assing' to 'assign'
};

interface CalculationResult {
    expression: string;
    result: string;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState<CalculationResult>({ expression: "", result: "" });
    const [dictOfVars, setDictOfVars] = useState({});
    const [canvasbg, setCanvasbg] = useState('black');
    const [latex, setLatex] = useState<Array<string>>([]);
    const [latexPosition, setLatexPosition] = useState({x: 10, y: 100});
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });


    const sendData = async () => {
        const canvas = canvasRef.current;
        if (canvas) {
            try {
                console.log("Sending data to server...");
                const response = await axios({
                    method: "post",
                    url: `${import.meta.env.VITE_API_URL}/calculate/`,
                    data: {
                        data: canvas.toDataURL('image/png'),
                        dict_of_vars: dictOfVars,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const data = response.data;
                console.log("Raw response data:", data);
                console.log("Response data type:", typeof data);
                
                if (data && Array.isArray(data) && data.length > 0) {
                    const firstResult = data[0];
                    console.log("First result:", firstResult);
                    
                    setResult({
                        expression: firstResult.expr || "",
                        result: firstResult.result || ""
                    });
                    console.log("Setting result:", firstResult.expr, firstResult.result);
                } else if (typeof data === 'string') {
                    try {
                        // Try to parse if it's a JSON string
                        const parsedData = JSON.parse(data);
                        console.log("Parsed data:", parsedData);
                        
                        if (Array.isArray(parsedData) && parsedData.length > 0) {
                            const firstResult = parsedData[0];
                            setResult({
                                expression: firstResult.expr || "",
                                result: firstResult.result || ""
                            });
                            console.log("Setting result from parsed data:", firstResult.expr, firstResult.result);
                        }
                    } catch (parseError) {
                        console.error("Error parsing response as JSON:", parseError);
                    }
                } else {
                    console.log("No valid data in response");
                }
            } catch (error) {
                console.error("Error sending data:", error);
                setResult({
                    expression: "Error",
                    result: "Failed to process the image. Please try again."
                });
            }
        }
    }

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d")
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    // Handle canvas reset when the reset button is clicked
    useEffect(() => {
        if (reset) {
            resetCanvas();
            setReset(false);
        }
    }, [reset]);

    // Function to get proper drawing coordinates from both mouse and touch events
    const getCoordinates = (event: React.MouseEvent | React.TouchEvent | TouchEvent) => {
        let clientX, clientY;
        
        // Check if it's a touch event
        if ('touches' in event) {
            // Prevent scrolling when drawing
            event.preventDefault();
            // Get the first touch point
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            // It's a mouse event
            clientX = (event as React.MouseEvent).clientX;
            clientY = (event as React.MouseEvent).clientY;
        }

        return { x: clientX, y: clientY };
    };

    // Initial canvas setup - runs only once
    useEffect(() => {
        const setupCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext("2d", { willReadFrequently: true });
                if (context) {
                    // Try to save the current drawing state if canvas already has dimensions
                    let imageData;
                    try {
                        if (canvas.width > 0 && canvas.height > 0) {
                            imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        }
                    } catch (e) {
                        console.log("Could not save canvas state", e);
                    }
                    
                    // Set canvas dimensions to match viewport
                    const rect = canvas.getBoundingClientRect();
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight - rect.top;
                    
                    // Set drawing properties
                    context.lineWidth = 5;
                    context.lineCap = "round";
                    context.lineJoin = "round"; // Smoother line joins
                    
                    // Restore the drawing if there was one
                    if (imageData && imageData.width > 0 && imageData.height > 0) {
                        try {
                            context.putImageData(imageData, 0, 0);
                        } catch (e) {
                            console.log("Canvas resized, couldn't restore exact drawing");
                        }
                    }
                }
            }
        };
        
        // Initial setup
        setupCanvas();


        // Load MathJax
        if (!(window as any).MathJax) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            script.async = true;
            script.id = 'mathjax-script';
            
            // Configure MathJax
            (window as any).MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']]
                },
                svg: {
                    fontCache: 'global'
                }
            };
            
            document.head.appendChild(script);
            
            return () => {
                const mathJaxScript = document.getElementById('mathjax-script');
                if (mathJaxScript) {
                    document.head.removeChild(mathJaxScript);
                }
            };
        }
        
        // Add window resize event listener with debounce
        let resizeTimer: number | null = null;
        const handleResize = () => {
            if (resizeTimer) {
                window.clearTimeout(resizeTimer);
            }
            resizeTimer = window.setTimeout(() => {
                setupCanvas();
            }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        
        // Clean up event listeners on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (resizeTimer) {
                window.clearTimeout(resizeTimer);
            }
        };
    }, []);

    // Handle background color changes separately
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = canvasbg;
        }
    }, [canvasbg]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.cursor = "crosshair";
            const context = canvas.getContext("2d");
            if (context) {
                const coords = getCoordinates(e);
                context.beginPath();
                context.moveTo(coords.x, coords.y);
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
                const coords = getCoordinates(e);
                context.strokeStyle = color;
                context.lineTo(coords.x, coords.y);
                context.stroke();
            }
        }
    };

    // Add touch event handlers to the canvas element
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault(); // Prevent scrolling
            const coords = getCoordinates(e);
            const context = canvas.getContext("2d");
            if (context) {
                context.beginPath();
                context.moveTo(coords.x, coords.y);
                setIsDrawing(true);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDrawing) return;
            e.preventDefault(); // Prevent scrolling
            const coords = getCoordinates(e);
            const context = canvas.getContext("2d");
            if (context) {
                context.strokeStyle = color;
                context.lineTo(coords.x, coords.y);
                context.stroke();
            }
        };

        const handleTouchEnd = () => {
            setIsDrawing(false);
        };

        // Add touch event listeners
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('touchcancel', handleTouchEnd);

        // Clean up
        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [color, isDrawing]); // Re-add event listeners if these dependencies change

    // Define common button styles based on canvasbg
    const getButtonStyles = () => ({
        backgroundColor: canvasbg === 'black' ? 'white' : 'black',
        color: canvasbg === 'black' ? 'black' : 'white'
    });

    // Render LaTeX on canvas when result changes
    useEffect(() => {
        if (!result.expression && !result.result) return;
        console.log("Result changed:", result);
        
        const renderLatexToCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;
            
            // Create a temporary div to render LaTeX
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.color = canvasbg === 'black' ? 'white' : 'black';
            tempDiv.style.fontSize = '24px';
            
            // Add the LaTeX content
            const latexExpression = `$${result.expression}$`;
            const latexResult = `$= ${result.result}$`;
            
            tempDiv.innerHTML = `<div>${latexExpression}</div><div>${latexResult}</div>`;
            document.body.appendChild(tempDiv);
            
            // Process the LaTeX with MathJax
            const MathJax = (window as any).MathJax;
            if (MathJax) {
                // For MathJax v3
                if (MathJax.typeset) {
                    MathJax.typeset([tempDiv]);
                    
                    // Get the LaTeX container that's already in the DOM
                    const latexContainer = document.getElementById('latex-container');
                    if (latexContainer) {
                        latexContainer.innerHTML = `<div>${latexExpression}</div><div>${latexResult}</div>`;
                        latexContainer.style.color = canvasbg === 'black' ? 'white' : 'black';
                        
                        // Re-process with MathJax
                        MathJax.typeset([latexContainer]);
                    }
                    
                    // Create new array of LaTeX elements
                    const newLatex = [latexExpression, latexResult];
                    setLatex(newLatex);
                    
                    // Remove the temporary div
                    document.body.removeChild(tempDiv);
                }
                // For MathJax v2 (fallback)
                else if (MathJax.Hub) {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, tempDiv]);
                    
                    MathJax.Hub.Queue(() => {
                        // Get the LaTeX container that's already in the DOM
                        const latexContainer = document.getElementById('latex-container');
                        if (latexContainer) {
                            latexContainer.innerHTML = `<div>${latexExpression}</div><div>${latexResult}</div>`;
                            latexContainer.style.color = canvasbg === 'black' ? 'white' : 'black';
                            
                            // Re-process with MathJax
                            MathJax.Hub.Queue(["Typeset", MathJax.Hub, latexContainer]);
                        }
                        
                        // Create new array of LaTeX elements
                        const newLatex = [latexExpression, latexResult];
                        setLatex(newLatex);
                        
                        // Remove the temporary div
                        document.body.removeChild(tempDiv);
                    });
                }
            } else {
                console.error("MathJax not loaded");
                
                // Fallback to plain text if MathJax is not available
                const latexContainer = document.getElementById('latex-container');
                if (latexContainer) {
                    latexContainer.innerHTML = `
                        <div>Expression: ${result.expression}</div>
                        <div>Result: ${result.result}</div>
                    `;
                    latexContainer.style.color = canvasbg === 'black' ? 'white' : 'black';
                }
            }
        };
        
        // Render LaTeX after a short delay to ensure MathJax is loaded
        const timer = setTimeout(() => {
            renderLatexToCanvas();
        }, 1000); // Increased timeout to ensure MathJax is fully loaded
        
        return () => clearTimeout(timer);
    }, [result, canvasbg, latexPosition]);

    // Handle dragging of the LaTeX container
    const handleLatexMouseDown = (e: React.MouseEvent) => {
        // Only start drag if it's not a drawing operation
        if (e.button === 0) { // Left mouse button
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - latexPosition.x,
                y: e.clientY - latexPosition.y
            });
            e.stopPropagation(); // Prevent canvas drawing
        }
    };

    const handleLatexMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setLatexPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
            e.stopPropagation(); // Prevent canvas drawing
        }
    };

    const handleLatexMouseUp = () => {
        setIsDragging(false);
    };

    // Add global mouse event listeners for dragging
    useEffect(() => {
        const mouseMoveHandler = (e: MouseEvent) => {
            if (isDragging) {
                setLatexPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };
        
        const mouseUpHandler = () => {
            setIsDragging(false);
        };
        
        if (isDragging) {
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        }
        
        return () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    }, [isDragging, dragOffset.x, dragOffset.y]);

    return (
        <>
            {/* Add a meta viewport tag for mobile devices */}
            <div className="flex flex-row flex-wrap gap-3 justify-center items-center p-2 z-20 relative">
                <Button
                    onClick={() => setReset(true)}
                    variant="default"
                    className="z-20"
                    style={getButtonStyles()}
                >
                    Reset Canvas
                </Button>

                <Group className="z-20">
                    {/* Add container for swatches with hover effect */}
                    <div className="flex space-x-1">
                        {SWATCHES.map((swatchColor: string) => (
                            <div 
                                key={swatchColor} 
                                className="transition-transform hover:scale-125 hover:-translate-y-1 duration-200"
                            >
                                <ColorSwatch
                                    color={swatchColor}
                                    onClick={() => setColor(swatchColor)}
                                    style={{ cursor: 'pointer', width: '32px', height: '32px' }}
                                />
                            </div>
                        ))}
                    </div>
                </Group>

                <Button
                    onClick={() => sendData()}
                    variant="default"
                    className="z-20"
                    style={getButtonStyles()}
                >
                    Calculate
                </Button>

                {(result.expression || result.result) && (
                    <Button
                        onClick={() => setResult({ expression: "", result: "" })}
                        variant="default"
                        className="z-20"
                        style={getButtonStyles()}
                    >
                        Clear Result
                    </Button>
                )}

                <Button
                    onClick={() => setCanvasbg(canvasbg === 'black' ? 'white' : 'black')}
                    variant="default"
                    className="z-20 flex items-center justify-center"
                    style={getButtonStyles()}
                    aria-label={`Switch to ${canvasbg === 'black' ? 'white' : 'black'} background`}
                >
                    {canvasbg === 'black' ? <IconSun size={20} /> : <IconMoon size={20} />}
                </Button>
            </div>

            <canvas
                ref={canvasRef}
                id="canvas"
                className="w-full h-full absolute top-0 left-0 touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
            
            {/* LaTeX result display container */}
            {(result.expression || result.result) && (
                <div 
                    id="latex-container" 
                    className="absolute z-30 p-4 rounded-md bg-opacity-70 cursor-move border-2"
                    style={{
                        top: `${latexPosition.y}px`,
                        left: `${latexPosition.x}px`,
                        color: canvasbg === 'black' ? 'white' : 'black',
                        backgroundColor: canvasbg === 'black' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                        borderColor: canvasbg === 'black' ? 'white' : 'black',
                        minWidth: '200px',
                        minHeight: '100px',
                        fontSize: '18px'
                    }}
                    onMouseDown={handleLatexMouseDown}
                >
                    {/* Fallback content in case MathJax fails */}
                    <div className="font-bold">Expression: {result.expression}</div>
                    <div className="font-bold">Result: {result.result}</div>
                </div>
            )}
        </>
    )
}
