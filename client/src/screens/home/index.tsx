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


    const sendData = async () => {
        const canvas = canvasRef.current;
        if (canvas) {
            try {
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
                console.log('data', data);
                
                if (data && Array.isArray(data) && data.length > 0) {
                    const firstResult = data[0];
                    setResult({
                        expression: firstResult.expr || "",
                        result: firstResult.result || ""
                    });
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
                const context = canvas.getContext("2d");
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
        </>
    )
}
