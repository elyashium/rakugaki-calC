//making a HTMLcanvas with ref hook
import { useRef, useState, useEffect } from "react"


export default function index() {
const canvasRef = useRef<HTMLCanvasElement>(null)
const [isDrawing, setIsDrawing] = useState(false)


//mounting the canvas with useEffect
useEffect(()=>{
const canvas = canvasRef.current;
if(canvas){
    const context = canvas.getContext("2d")
        if(context){
        context.lineWidth = 5; //setting the line width
        context.lineCap = "round" //setting the line cap
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop; //setting the height of the canvas
        }
    }
}, []);

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

const draw =(e: HTMLCanvasElement)=>{
    const canvas = canvasRef.current;
    if(canvas){
        const context = canvas.getContext("2d")
        if(context){
            context.strokeStyle = "white"
            context.lineTo(e.nativeEvent.clientX, e.nativeEvent.clientY)
            context.stroke()
        }
    }
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
