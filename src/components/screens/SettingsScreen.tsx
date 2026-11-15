"use client";

// Owner: Arshawn. Settings, opened from the profile button on Today's top bar (his ask 2026-11-15: "a button in like settings or
// something that is demo mode where it completely starts from onboarding and primes the webapp in demo mode"). Sidestash rows on flat
// cards, one page (DESIGN options.settings_ia single-page). Everything here lives on this device only:
//   Edit my plan, college and hall: onboarding with the saved answers filled in.
//   Start demo: a second tap confirms, then the profile and every saved plate on this phone are cleared, demo mode turns on and
//     onboarding starts at the first question. Finishing it seeds today's example plates (demoSeed.ts).
//   Leave demo: demo mode off, the example plates removed; anything the student logged stays.
// Read after mount only (profile, plates and the demo switch live in localStorage; pages open static).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, PencilEdit02Icon, PlayCircleIcon, Logout03Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Appear, Swap } from "@/components/ui/motion";
import { PROFILE_KEY, useProfile } from "@/lib/profile";
import { setDemo, useDemoMode } from "@/lib/demoMode";
import { HALLS, MEAL_PLANS } from "@/lib/halls";
import { clearPlates, DEMO_PLATE, loadPlates, removeDemoPlates } from "./plates";
import "./settings.css";

const noSubscribe = () => () => {};

function clearProfile() {
  try { window.localStorage.removeItem(PROFILE_KEY); } catch { /* blocked storage: nothing was saved */ }
  // useProfile listens for "storage"; a same-tab removal fires none, so send one
  try { window.dispatchEvent(new StorageEvent("storage", { key: PROFILE_KEY })); } catch { /* old browser: the next page load reads it */ }
}

export function SettingsScreen() {
  const router = useRouter();
  const profile = useProfile();
  const demo = useDemoMode();
  const [confirm, setConfirm] = useState(false);
  // Next keeps this route's state between visits: the confirm step closes whenever the page is left, so it never greets a return
  useEffect(() => () => setConfirm(false), []);
  // counted when the confirm opens, so the line says exactly what will be cleared (null on the server)
  const counts = useSyncExternalStore(noSubscribe, () => {
    const all = loadPlates();
    return `${all.length}|${all.filter((p) => typeof p?.id === "string" && p.id.startsWith(DEMO_PLATE)).length}`;
  }, () => null);
  const [plates] = (counts ?? "0|0").split("|").map(Number);

  const planLine = profile
    ? [MEAL_PLANS.find((p) => p.id === profile.plan)?.label + " plan", `${profile.pointsNow.toLocaleString()} points`, profile.college, HALLS.find((h) => h.id === profile.usualHall)?.short].filter(Boolean).join(" · ")
    : profile === null ? "Not set up on this phone yet" : " ";

  const startDemo = () => {
    clearProfile();
    clearPlates();
    setDemo(true);
    router.push("/onboarding");
  };
  const leaveDemo = () => {
    removeDemoPlates();
    setDemo(false);
  };
  const clearsLine = [profile ? "your plan, points, college and hall" : null, plates ? `${plates} saved ${plates === 1 ? "plate" : "plates"}` : null].filter(Boolean).join(" and ");

  return (
    <Screen wash top={<div className="topbar">
        <Link href="/" className="iconbtn" aria-label="Back to Today"><Icon icon={ArrowLeft01Icon} size={18} /></Link>
        <span className="center">Settings</span>
        <span style={{ width: 44 }} aria-hidden />
      </div>}>

      <div className="st-sec">
        <h2 className="st-head">Your plan</h2>
        <div className="card st-card">
          <Link href="/onboarding" className="row st-row press">
            <span className="st-ic"><Icon icon={PencilEdit02Icon} size={18} sw={2} /></span>
            <span className="grow"><span className="title">Edit my plan, college and hall</span><span className="sub">{planLine}</span></span>
            <Icon icon={ArrowRight01Icon} size={16} sw={2} />
          </Link>
        </div>
      </div>

      <div className="st-sec">
        <div className="st-headrow">
          <h2 className="st-head">Demo mode</h2>
          <span className={`st-state ${demo ? "on" : ""}`}><Swap id={demo ? "on" : "off"}>{demo ? "On" : "Off"}</Swap></span>
        </div>
        <div className="card st-card">
          <Appear id={confirm ? "confirm" : "start"}>
            {!confirm ? (
              <button type="button" className="row st-row press" onClick={() => setConfirm(true)}>
                <span className="st-ic blue"><Icon icon={PlayCircleIcon} size={18} sw={2} /></span>
                <span className="grow"><span className="title">Start demo</span><span className="sub">Starts over from the first question, with mock rankings and example plates</span></span>
                <Icon icon={ArrowRight01Icon} size={16} sw={2} />
              </button>
            ) : (
              <div className="st-confirm" role="group" aria-label="Confirm start demo">
                <span className="st-ic red"><Icon icon={Delete02Icon} size={18} sw={2} /></span>
                <div className="grow">
                  <span className="title">Start over in demo mode?</span>
                  <span className="sub">{clearsLine ? `This clears ${clearsLine} on this phone.` : "Nothing is saved on this phone yet, so nothing is lost."}</span>
                  <div className="st-actions">
                    <button type="button" className="btn btn-sm st-danger" onClick={startDemo}>{clearsLine ? "Clear and start" : "Start demo"}</button>
                    <button type="button" className="btn btn-sm btn-secondary raised" onClick={() => setConfirm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </Appear>
          {demo && (
            <button type="button" className="row st-row press" onClick={leaveDemo}>
              <span className="st-ic"><Icon icon={Logout03Icon} size={18} sw={2} /></span>
              <span className="grow"><span className="title">Leave demo</span><span className="sub">Back to real votes; example plates are removed</span></span>
            </button>
          )}
        </div>
        <p className="label st-foot">Demo mode shows mock rankings built from this week&apos;s real menus. Nothing is sent to the real leaderboard. Everything on this page stays on this phone.</p>
      </div>
    </Screen>
  );
}
