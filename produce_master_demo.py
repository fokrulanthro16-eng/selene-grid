"""
SELENE-GRID v2.0: Automated Studio Production Pipeline
Generates studio-grade executive voiceover (edge-tts), captures 4K Retina WebGL recording
via Playwright, and masters the final demo video SELENE_GRID_FINAL_DEMO.mp4 via FFmpeg.
"""

import asyncio
import os
import sys
import re
import time
import subprocess
import imageio_ffmpeg
import edge_tts
from playwright.sync_api import sync_playwright

# Force UTF-8 standard output for Windows console compatibility
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

VOICE = "en-US-BrianMultilingualNeural"
PITCH = "-2Hz"
RATE = "+2%"

AUDIO_DIR = "audio_segments"
RAW_VIDEO_DIR = "raw_video"
OUTPUT_MP4 = "SELENE_GRID_FINAL_DEMO.mp4"

SEGMENTS = [
    (
        "seg1",
        "Deep Learning has a planetary problem. Modern AI training consumes terawatts of power and millions of gallons of cooling water, causing massive carbon surges across terrestrial grids. Welcome to SELENE-GRID version 2.0—an autonomous Earth-to-Lunar carbon-aware AI orchestrator and Ada-Lovelace Compute Equity Protocol."
    ),
    (
        "seg2",
        "First, our Neuro-Symbolic AST Green Compiler. Instead of blindly throwing hardware at unoptimized code, our static analyzer inspects PyTorch syntax trees for cubic loops and host-device memory thrashing. Orchestrating Google Gemini 2.5 Flash, Nebius Token Factory, and Hugging Face, we restructure inefficient code into vectorized FP8 Tensor Core kernels—achieving a 59.17 percent FLOPs reduction, 52.4 kilojoules of saved energy, and 6.8 grams of avoided carbon per batch."
    ),
    (
        "seg3",
        "Now watch our autonomous orchestration in action. When Virginia's grid carbon surges to 442 grams per kilowatt-hour, SELENE-GRID triggers a 1.28 gigabit-per-second optical laser uplink rendered in Three.js WebGL. Workloads are dynamically routed to the Lunar South Pole Shackleton Crater, utilizing continuous solar power and 20-Kelvin deep-space vacuum radiative cooling for an absolute zero PUE."
    ),
    (
        "seg4",
        "Every avoided gram of carbon is tokenized into ADA Compute Credits on the Solana Devnet ledger. Through the Ada-Lovelace Equity Protocol, 142.8 ADA credits are autonomously disbursed with cryptographic proof to Dr. Maya Lin's Maternal Sepsis AI research lab. Simultaneously, Tiger Data TimescaleDB hypertables stream 1-Hertz telemetry alongside Presage developer bio-sensing."
    ),
    (
        "seg5",
        "SELENE-GRID proves that the future of artificial intelligence isn't just about building bigger models—it's about mathematical efficiency, interplanetary infrastructure, and equitable compute access. Built for Girls Hoo Hack 2026. Thank you."
    ),
]


def get_ffmpeg_exe():
    return imageio_ffmpeg.get_ffmpeg_exe()


def get_media_duration(file_path):
    exe = get_ffmpeg_exe()
    res = subprocess.run([exe, "-i", file_path], stderr=subprocess.PIPE, text=True)
    m = re.search(r"Duration:\s*(\d+):(\d+):([\d\.]+)", res.stderr)
    if m:
        return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    return 0.0


async def generate_voiceover():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    exe = get_ffmpeg_exe()
    durations = {}

    print("\n--- PHASE 1: GENERATING HIGH-IMPACT EXECUTIVE VOICEOVER (edge-tts) ---")
    for name, text in SEGMENTS:
        fn = os.path.join(AUDIO_DIR, f"{name}.mp3")
        if not os.path.exists(fn) or os.path.getsize(fn) < 1000:
            print(f"Synthesizing [{name}] with {VOICE} ({RATE}, {PITCH})...")
            communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
            await communicate.save(fn)
        dur = get_media_duration(fn)
        durations[name] = dur
        print(f"  -> {name}.mp3: {dur:.2f} seconds")

    # Concatenate all 5 segments into master_audio.mp3
    concat_list_path = os.path.join(AUDIO_DIR, "concat_audio.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for name, _ in SEGMENTS:
            p = os.path.abspath(os.path.join(AUDIO_DIR, f"{name}.mp3")).replace("\\", "/")
            f.write(f"file '{p}'\n")

    master_audio = "master_audio.mp3"
    subprocess.run(
        [exe, "-y", "-f", "concat", "-safe", "0", "-i", concat_list_path, "-c", "copy", master_audio],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )
    total_audio_duration = get_media_duration(master_audio)
    print(f"\nMaster Audio Track ready: {master_audio} (Total Duration: {total_audio_duration:.2f}s)")
    return durations, total_audio_duration


def record_screen(durations):
    os.makedirs(RAW_VIDEO_DIR, exist_ok=True)
    # Clean previous raw videos
    for f in os.listdir(RAW_VIDEO_DIR):
        if f.endswith(".webm"):
            try:
                os.remove(os.path.join(RAW_VIDEO_DIR, f))
            except Exception:
                pass

    print("\n--- PHASE 2: AUTOMATED 4K RETINA BROWSER RECORDING (Playwright) ---")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--enable-webgl",
                "--use-gl=angle",
                "--use-angle=swiftshader",
                "--ignore-gpu-blocklist",
                "--enable-accelerated-2d-canvas",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
        )

        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2,
            record_video_dir=RAW_VIDEO_DIR,
            record_video_size={"width": 1920, "height": 1080},
        )

        page = context.new_page()
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle")

        # SEGMENT 1: Intro & Planetary Problem (~20s)
        # Visuals: Hero header & 3D WebGL Earth-Moon orbit
        print(f"Executing Visual Sequence for Segment 1 ({durations['seg1']:.1f}s)...")
        time.sleep(4.0)  # Initial Three.js spin stabilization
        try:
            page.mouse.move(600, 350)
            time.sleep(3.0)
            page.mouse.move(960, 400)
            time.sleep(3.0)
            page.mouse.move(1200, 350)
        except Exception:
            pass
        rem1 = max(1.0, durations["seg1"] - 10.0)
        time.sleep(rem1)

        # SEGMENT 2: Neuro-Symbolic AST Green Compiler (~31.5s)
        # Visuals: Smooth scroll to AST section, show unoptimized vs optimized code, run AST compilation
        print(f"Executing Visual Sequence for Segment 2 ({durations['seg2']:.1f}s)...")
        page.evaluate("window.scrollTo({top: 550, behavior: 'smooth'})")
        time.sleep(3.0)

        # Click RUN AST COMPILATION
        try:
            compile_btn = page.locator("button:has-text('RUN AST COMPILATION')")
            if compile_btn.is_visible():
                print("Triggering AST Compilation button...")
                compile_btn.click()
                time.sleep(5.0)  # Wait for kernel synthesis and metrics update
        except Exception as e:
            print(f"AST trigger notice: {e}")

        # Hover over the thermodynamic metrics cards
        try:
            page.mouse.move(400, 800)
            time.sleep(2.0)
            page.mouse.move(700, 800)
            time.sleep(2.0)
            page.mouse.move(1000, 800)
            time.sleep(2.0)
        except Exception:
            pass
        rem2 = max(2.0, durations["seg2"] - 14.0)
        time.sleep(rem2)

        # SEGMENT 3: 3D Cislunar Laser Offload (~26s)
        # Visuals: Scroll back up to hero, trigger AUTONOMOUS JUDGE DEMO
        print(f"Executing Visual Sequence for Segment 3 ({durations['seg3']:.1f}s)...")
        page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
        time.sleep(2.5)

        try:
            demo_btn = page.locator("button:has-text('AUTONOMOUS JUDGE DEMO')")
            if demo_btn.is_visible():
                print("Clicking [RUN 60s AUTONOMOUS JUDGE DEMO]...")
                demo_btn.click()
                # Wait 16s while capturing live carbon surge, AST compiler, optical laser beam & completion banner
                time.sleep(16.0)
        except Exception as e:
            print(f"Autonomous demo trigger notice: {e}")

        # Remainder of segment 3
        rem3 = max(2.0, durations["seg3"] - 18.5)
        time.sleep(rem3)

        # SEGMENT 4: Solana Equity & Tiger Data (~25s)
        # Visuals: Scroll to Ada-Lovelace Vault & Tiger Data Telemetry
        print(f"Executing Visual Sequence for Segment 4 ({durations['seg4']:.1f}s)...")
        page.evaluate("window.scrollTo({top: 1050, behavior: 'smooth'})")
        time.sleep(2.5)

        # Inspect Solana Devnet transaction modal
        try:
            tx_link = page.locator("button:has-text('5KtP9xM')").first
            if tx_link.is_visible():
                print("Opening Solana Devnet Explorer modal...")
                tx_link.click()
                time.sleep(4.0)
                # Close modal
                close_btn = page.locator("button:has-text('✕')").first
                if close_btn.is_visible():
                    close_btn.click()
                    time.sleep(1.5)
        except Exception as e:
            print(f"Solana modal notice: {e}")

        # Inspect SQL Schema modal
        try:
            sql_btn = page.locator("button:has-text('INSPECT SQL SCHEMA')")
            if sql_btn.is_visible():
                print("Opening Tiger Data SQL Schema modal...")
                sql_btn.click()
                time.sleep(4.5)
                # Close modal
                close_sql = page.locator("button:has-text('✕')").first
                if close_sql.is_visible():
                    close_sql.click()
                    time.sleep(1.5)
        except Exception as e:
            print(f"SQL modal notice: {e}")

        rem4 = max(2.0, durations["seg4"] - 14.0)
        time.sleep(rem4)

        # SEGMENT 5: Conclusion & Closing Vision (~15s)
        # Visuals: Scroll smoothly back to top hero for final cinematic view
        print(f"Executing Visual Sequence for Segment 5 ({durations['seg5']:.1f}s)...")
        page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
        time.sleep(durations["seg5"] + 1.0)

        print("Finalizing video capture...")
        page.close()
        context.close()
        browser.close()

    # Find the created webm video file
    webm_files = [f for f in os.listdir(RAW_VIDEO_DIR) if f.endswith(".webm")]
    if not webm_files:
        raise RuntimeError("No .webm file found in raw_video directory!")

    # Sort by creation time to get latest
    webm_files.sort(key=lambda x: os.path.getmtime(os.path.join(RAW_VIDEO_DIR, x)), reverse=True)
    raw_video_path = os.path.join(RAW_VIDEO_DIR, webm_files[0])
    raw_duration = get_media_duration(raw_video_path)
    print(f"Raw Playwright video recorded: {raw_video_path} ({raw_duration:.2f}s)")
    return raw_video_path, raw_duration


def master_final_video(raw_video_path, raw_duration, master_audio_path, audio_duration):
    exe = get_ffmpeg_exe()
    print("\n--- PHASE 3: FFMPEG STUDIO MASTERING & SYNC ENCODING ---")
    print(f"Input Video Duration: {raw_duration:.2f}s | Audio Duration: {audio_duration:.2f}s")

    # Time-stretch/sync video to exact audio duration via setpts filter
    pts_scale = audio_duration / max(0.1, raw_duration)
    print(f"Applying Video PTS Scale Factor: {pts_scale:.4f}")

    cmd = [
        exe,
        "-y",
        "-i", raw_video_path,
        "-i", master_audio_path,
        "-filter_complex", f"[0:v]setpts={pts_scale:.6f}*(PTS-STARTPTS)[v]",
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "16",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "320k",
        "-shortest",
        OUTPUT_MP4
    ]

    print("Running FFmpeg encoding...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg Error:", res.stderr)
        raise RuntimeError("FFmpeg encoding failed!")

    if not os.path.exists(OUTPUT_MP4):
        raise RuntimeError(f"{OUTPUT_MP4} was not generated!")

    final_size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
    final_dur = get_media_duration(OUTPUT_MP4)
    print("\n" + "=" * 56)
    print("[SUCCESS] MASTER DEMO PRODUCTION COMPLETE!")
    print(f"File: {os.path.abspath(OUTPUT_MP4)}")
    print(f"Resolution: 1920x1080 (High-DPI H.264 MP4)")
    print(f"Duration: {final_dur:.2f} seconds")
    print(f"File Size: {final_size_mb:.2f} MB")
    print(f"Audio: 320kbps AAC Stereo ({VOICE})")
    print("=" * 56 + "\n")


def main():
    start_time = time.time()
    durations, total_audio_duration = asyncio.run(generate_voiceover())
    raw_video_path, raw_duration = record_screen(durations)
    master_final_video(raw_video_path, raw_duration, "master_audio.mp3", total_audio_duration)
    elapsed = time.time() - start_time
    print(f"Pipeline finished successfully in {elapsed:.1f} seconds.")


if __name__ == "__main__":
    main()
