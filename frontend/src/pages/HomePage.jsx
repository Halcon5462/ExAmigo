import React from "react";

import BackgroundGlow from "../components/home/BackgroundGlow";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import PhilosophySection from "../components/home/PhilosophySection";

export default function HomePage() {
  return (
    <div style={{ position: "relative" }}>
      <BackgroundGlow />

      <div style={{ position: "relative", zIndex: 1 }}>
        <HeroSection />
        <FeaturesSection />
        <PhilosophySection />
      </div>
    </div>
  );
}