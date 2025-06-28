//making a HTMLcanvas with ref hook
import { useRef, useState } from "react"


export default function index() {
const canvasRef = useRef<HTMLCanvasElement>(null)
const [isDrawing, setIsDrawing] = useState(false)


const startDrawing = (e : React.MouseEvent<HTMLCanvasElement>) =>{
    const canvas = canvasRef.current;
    if(canvas){
        canvas.style.cursor = "crosshair"
        canvas.style.background= "black"
        const context = canvas.getContext("2d")
        //this context is used to draw on the canvas
        if(context){
            context.beginPath();
            context.moveTo(e.nativeEvent.clientX, e.nativeEvent.clientY)
            setIsDrawing(true)
        }
    }
}

const stopDrawing = () =>{
    setIsDrawing(false)
}




  return (
    <canvas 
    ref={canvasRef}
    id = "canvas"
    className = "w-full h-full absolute top-0 left-0"
    onMouseDown = {startDrawing}
    onMouseUp = {stopDrawing}
    onMouseOut = {stopDrawing}
    />
    
    
  )
}
