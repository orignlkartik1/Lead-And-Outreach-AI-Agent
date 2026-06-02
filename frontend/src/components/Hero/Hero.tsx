import React from 'react'
import './Hero.css'

const Hero: React.FC = () => {
  return (
    <section className="hero-wrapper" aria-label="Application hero">
      <div className="nodes">
        <div className="node left">Source</div>
        <div className="node center">Our App</div>
        <div className="node right">Target</div>
      </div>

      <div className="flows" aria-hidden>
        <div className="packet p1" />
        <div className="packet p2" />
        <div className="packet p3" />
      </div>

      <div className="hero-caption">
        <h1>Visualize. Transform. Deliver.</h1>
        <p className="muted">Animated flow shows how data moves through the core pipeline.</p>
      </div>
    </section>
  )
}

export default Hero
