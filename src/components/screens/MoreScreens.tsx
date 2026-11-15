"use client";

// Owner: Arshawn (UI). Vote and Dining services: Karen wires data. Onboarding and Ask: Ethan wires data.
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft01Icon, QrCodeIcon, SparklesIcon, ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Screen } from "@/components/ui/Screen";
import { Swap, Appear, GooSlider, SPRING } from "@/components/ui/motion";
import { DISHES, HALLS } from "./demo";

/* ── Live QR vote: moved to ./VoteScreen.tsx (real rounds, QR and live tallies) ── */
export { VoteScreen } from "./VoteScreen";

/* ── Onboarding and Ask SlugGrub moved to their own files (OnboardingScreen.tsx, AskScreen.tsx) when they were wired to real
   data; re-exported here so existing imports keep working. ── */
export { OnboardingScreen } from "./OnboardingScreen";
export { AskScreen } from "./AskScreen";

/* ── Dining services view: moved to ./DiningServicesScreen.tsx (stored votes and skips) ── */
export { DiningServicesScreen } from "./DiningServicesScreen";
