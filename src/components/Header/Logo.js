import React from 'react'
import Image from "next/image"
import Link from "next/link"
import profileImg from "@/public/img.jpg"
const Logo = () => {
  return (
    <Link href ="/" className = "flex items-center text-dark">
        <div className= "w-16 rounded-full overflow-hidden border border-solid border-dark">
            <Image src = {profileImg} alt = "LeThienDoanh" className = "w-full h-auto rounded-full"    />
        </div> 
        <span className ="font-bold text-xl"> OOAD </span>
    </Link> 

  )
}

export default Logo