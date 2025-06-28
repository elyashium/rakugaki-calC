//making a HTMLcanvas with ref hook
import { useRef, useState, useEffect } from "react"
import { SWATCHES } from "@/constants"
import { ColorSwatch, Group } from "@mantine/core"
import { Button } from "@mantine/core"
import axios from "axios"



interface ApiResponse {
    expr: string;
    result: string;
    assing: boolean; // Note: This might be a typo for 'assign'
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


    const sendData = async () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const response = await axios({
                method: "post",
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    data: canvas.toDataURL('image/png'),
                    dict_of_vars: dictOfVars,
                }
            })
            const data = response.data as ApiResponse;
            console.log('data', data);
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

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setReset(false);
        }
    }, [reset]);
    //using reset as dependency array because the canvas needs to be 
    //reset when the reset button is clicked

    //mounting the canvas with useEffect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d")
            if (context) {
                context.lineWidth = 5; //setting the line width
                context.lineCap = "round" //setting the line cap
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop; //setting the height of the canvas
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.cursor = "crosshair"
            canvas.style.background = "black"
            const context = canvas.getContext("2d")
            //this context is used to draw on the canvas
            if (context) {
                context.beginPath();
                context.moveTo(e.nativeEvent.clientX, e.nativeEvent.clientY)
                setIsDrawing(true)
            }
        }
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d")
            if (context) {
                context.strokeStyle = color;
                context.lineTo(e.nativeEvent.clientX, e.nativeEvent.clientY)
                context.stroke()
            }
        }
    }



    return (
        <>
            <div className="grid grid-cols gap 2">

                <Button
                    onClick={() => setReset(true)}
                    variant = "default"
                    color="black"
                    className="z-20 bg-black text-white"
                >
                    Reset Canvas
                </Button>

                <Group className="z-20">
                    {/* here will map the color swatches*/}
                    {SWATCHES.map((swatchColor: string) => (

                        <ColorSwatch
                            key={swatchColor}
                            color={swatchColor}
                            onClick={() => setColor(swatchColor)}
                        />

                    ))}
                </Group>

                <Button
                    onClick={() => sendData()}
                    // variant = "default"
                    color="black"
                    className="z-20 bg-black text-white"
                >
                    Calculate
                </Button>


            </div>
            <canvas
                ref={canvasRef}
                id="canvas"
                className="w-full h-full absolute top-0 left-0"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />

        </>

    )
}
