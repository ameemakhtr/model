"use client"

interface RotatingCardProps {
  frontImageSrc?: string
  backImageSrc?: string
  className?: string // Add className prop for external styling
}

export default function RotatingCard({
  frontImageSrc = "/placeholder.svg?height=220&width=350&text=Card+Front+Image",
  backImageSrc = "/placeholder.svg?height=220&width=350&text=Card+Back+Image",
  className,
}: RotatingCardProps) {
  return (
    <div className={`scene ${className}`}>
      <div className="credit-card">
        {/* Front Face */}
        <div className="card-face card-front">
          <img
            src={frontImageSrc || "/placeholder.svg"}
            alt="Card Front"
            className="w-full h-full object-cover rounded-[18px]"
          />
        </div>

        {/* Back Face */}
        <div className="card-face card-back">
          <img
            src={backImageSrc || "/placeholder.svg"}
            alt="Card Back"
            className="w-full h-full object-cover rounded-[18px]"
          />
        </div>
      </div>
      <style jsx>{`
        .scene {
          perspective: 1800px; /* Increased perspective for more depth */
          perspective-origin: center center;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .credit-card {
          width: 350px;
          height: 220px;
          position: relative;
          transform-style: preserve-3d;
          animation: elegantRotate 15s linear infinite; /* Faster, linear easing for continuous motion */
          border-radius: 18px;
          margin: 0 auto;
          will-change: transform;
          background-color: #333; /* Color for the card's thickness */
          box-shadow: 
            0 40px 80px rgba(0, 0, 0, 0.5), /* More pronounced shadow */
            0 0 0 1px rgba(255, 255, 255, 0.15), /* Sharper border highlight */
            inset 0 1px 0 rgba(255, 255, 255, 0.25); /* Inner highlight */
        }
        
        .card-face {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        
        .card-front {
          transform: rotateY(0deg) translateZ(5px);
        }
        
        .card-back {
          transform: rotateY(180deg) translateZ(5px);
        }
        
        @keyframes elegantRotate {
          0% {
            transform: rotateY(0deg) rotateX(0deg) rotateZ(0deg) scale(1);
          }
          25% {
            transform: rotateY(90deg) rotateX(10deg) rotateZ(-10deg) scale(1.01);
          }
          50% {
            transform: rotateY(180deg) rotateX(-10deg) rotateZ(10deg) scale(1);
          }
          75% {
            transform: rotateY(270deg) rotateX(10deg) rotateZ(-10deg) scale(1.01);
          }
          100% {
            transform: rotateY(360deg) rotateX(0deg) rotateZ(0deg) scale(1);
          }
        }
        
        @media (max-width: 640px) {
          .credit-card {
            width: 320px;
            height: 210px;
          }
        }
      `}</style>
    </div>
  )
}
