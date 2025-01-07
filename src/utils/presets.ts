import { Wave } from '../waves';
import type { PresetKey } from '../waves/types';

export const presets: Record<PresetKey, (wave: Wave) => void> = {
    0: (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Wave({
        lineColor: "white",
        lineWidth: 10,
        fillColor: { gradient: ["#FF9A8B", "#FF6A88", "#FF99AC"] },
        mirroredX: true,
        count: 5,
        rounded: true,
        frequencyBand: "base"
      }));
      wave.addAnimation(new wave.animations.Wave({
        lineColor: "white",
        lineWidth: 10,
        fillColor: { gradient: ["#FA8BFF", "#2BD2FF", "#2BFF88"] },
        mirroredX: true,
        count: 60,
        rounded: true
      }));
      wave.addAnimation(new wave.animations.Wave({
        lineColor: "white",
        lineWidth: 10,
        fillColor: { gradient: ["#FBDA61", "#FF5ACD"] },
        mirroredX: true,
        count: 25,
        rounded: true,
        frequencyBand: "highs"
      }));
    },
    1: (wave: Wave) => {
      wave.clearAnimations();
      // Create separate cube animations for top and bottom with different heights
      wave.addAnimation(new wave.animations.Cubes({
        bottom: true,
        top: false, // Explicitly set to false to avoid interference
        count: 40,
        cubeHeight: 29,
        fillColor: { gradient: ["#FA0000", "#006B1C"] },
        lineColor: "rgba(0,0,0,0)",
        radius: 0,
        gap: 2 // Explicitly set gap to ensure consistent spacing
      }));
      wave.addAnimation(new wave.animations.Cubes({
        top: true,
        bottom: false, // Explicitly set to false to avoid interference
        count: 80,
        cubeHeight: 13,
        fillColor: { gradient: ["#00D961", "#F76B00"] },
        lineColor: "rgba(0,0,0,0)",
        radius: 0,
        gap: 5 // Match gap with bottom cubes
      }));
      wave.addAnimation(new wave.animations.Circles({
        lineColor: { gradient: ["#FAD961", "#FAD961", "#F76B1C"], rotate: 90 },
        lineWidth: 5,
        diameter: 80,
        count: 4,
        frequencyBand: "base"
      }));
    },
    2: (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Glob({
        fillColor: { gradient: ["#FAD961", "#FAD961", "#F76B1C"], rotate: 45 },
        lineColor: "white",
        glow: { strength: 15, color: "#FAD961" },
        lineWidth: 10,
        count: 45
      }));
      wave.addAnimation(new wave.animations.Shine({
        lineColor: "#FAD961",
        glow: { strength: 15, color: "#FAD961" },
        diameter: 300,
        lineWidth: 10,
      }));
    },
    3: (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Square({
        lineColor: { gradient: ["#21D4FD", "#B721FF"] }
      }));
      wave.addAnimation(new wave.animations.Arcs({
        lineWidth: 4,
        lineColor: { gradient: ["#21D4FD", "#B721FF"] },
        diameter: 500,
        fillColor: { gradient: ["#21D4FD", "#21D4FD", "#B721FF"], rotate: 45 }
      }));
    },
    // Named animation presets
    'Arcs': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Arcs({ lineColor: "white", fillColor: "white" }));
    },
    'Circles': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Circles({ lineColor: "white", fillColor: "rgba(0,0,0,0)" }));
    },
    'Cubes': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Cubes({ lineColor: "white", fillColor: "white" }));
    },
    'Flower': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Flower({ lineColor: "white", fillColor: "white" }));
    },
    'Glob': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Glob({ lineColor: "white", fillColor: "white" }));
    },
    'Lines': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Lines({ lineColor: "white", fillColor: "white" }));
    },
    'Shine': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Shine({ lineColor: "white", fillColor: "white" }));
    },
    'Square': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Square({ lineColor: "white", fillColor: "white" }));
    },
    'Turntable': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Turntable({ lineColor: "white", fillColor: "white" }));
    },
    'Wave': (wave: Wave) => {
      wave.clearAnimations();
      wave.addAnimation(new wave.animations.Wave({ lineColor: "white", fillColor: "white" }));
    }
  };