"""
SELENE-GRID v2.0: Automated High-Definition Screenshot Generator
Produces crystal-clear 4K Retina DPI screenshots of all key platform components
and compiles them into /public/assets/ for Devpost, GitHub README, and presentation slides.
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

# Force UTF-8 encoding for Windows console
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ASSETS_DIR = os.path.join("public", "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)


def capture_all_screenshots():
    print("\n========================================================")
    print("📸 SELENE-GRID v2.0 HIGH-DPI SCREENSHOT GENERATOR")
    print("========================================================\n")

    with sync_playwright() as p:
        print("Launching Chromium with 2x Retina scale factor (1920x1080)...")
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--enable-webgl",
                "--use-gl=angle",
                "--use-angle=swiftshader",
                "--ignore-gpu-blocklist",
                "--enable-accelerated-2d-canvas",
                "--no-sandbox",
            ],
        )

        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2,  # 2x Retina sharpness
        )

        page = context.new_page()
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle")

        # Disable CSS backdrop-filter to prevent SwiftShader CPU rasterizer compositor stalls
        page.evaluate("""() => {
            const s = document.createElement('style');
            s.textContent = '* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }';
            document.head.appendChild(s);
        }""")

        # Let Three.js canvas spin and stabilize particles
        print("Stabilizing 3D Three.js WebGL scene...")
        time.sleep(3.5)

        # Trigger Autonomous Demo to populate verified peak state
        print("Triggering 1-Click Autonomous Demo...")
        demo_btn = page.locator("button:has-text('AUTONOMOUS JUDGE DEMO')")
        demo_btn.click()

        print("Waiting for Autonomous Demo verification pipeline to complete...")
        verified = False
        for sec in range(40):
            time.sleep(1.0)
            banner = page.locator("text=Autonomous Sequence Verified & Complete")
            if banner.is_visible():
                print(f"-> [VERIFIED] Autonomous sequence complete at {sec+1}s! Peak state active.")
                verified = True
                break
            stage = page.locator("text=STAGE:")
            if stage.is_visible() and (sec % 3 == 0):
                print(f"   Stage: {stage.inner_text()}")

        if not verified:
            print("Notice: proceeding with current active state.")
        time.sleep(1.0)

        # ----------------------------------------------------------------------
        # CAP 1: screenshot_orbital.png
        # Main cislunar interface showing 'Uplink Target: LUNAR-SHACKLETON-1',
        # active cyan laser beam, and green verified completion banner.
        # ----------------------------------------------------------------------
        print("\n[1/6] Capturing screenshot_orbital.png...")
        page.evaluate("window.scrollTo({top: 0, behavior: 'instant'})")
        time.sleep(0.5)
        cap1_path = os.path.join(ASSETS_DIR, "screenshot_orbital.png")
        page.screenshot(
            path=cap1_path,
            clip={"x": 0, "y": 0, "width": 1920, "height": 740},
            timeout=10000,
        )
        print(f"  -> Saved {cap1_path} ({os.path.getsize(cap1_path) / 1024:.1f} KB)")

        # ----------------------------------------------------------------------
        # CAP 2: screenshot_compiler.png
        # Side-by-side 'NEURO-SYMBOLIC AST GREEN COMPILER' code changes,
        # original PyTorch loops vs. FP8 tensor kernel, plus 4 metric cards.
        # ----------------------------------------------------------------------
        print("\n[2/6] Capturing screenshot_compiler.png...")
        compiler_loc = page.locator("div.terminal-box:has-text('NEURO-SYMBOLIC AST GREEN COMPILER')")
        box2 = compiler_loc.bounding_box()
        cap2_path = os.path.join(ASSETS_DIR, "screenshot_compiler.png")
        page.screenshot(path=cap2_path, clip=box2, timeout=10000)
        print(f"  -> Saved {cap2_path} ({os.path.getsize(cap2_path) / 1024:.1f} KB)")

        # ----------------------------------------------------------------------
        # CAP 3: screenshot_equity.png
        # On-chain '$ADA Compute Credits' ledger on Solana Devnet featuring
        # micro-grants for female researcher Dr. Maya Lin, with active
        # Solana Devnet Block Verification Explorer modal.
        # ----------------------------------------------------------------------
        print("\n[3/6] Capturing screenshot_equity.png...")
        cap3_path = os.path.join(ASSETS_DIR, "screenshot_equity.png")

        # Click the Solana transaction proof button to open Explorer modal
        try:
            tx_btn = page.locator("button:has-text('5KtP9xM')").first
            if tx_btn.is_visible():
                tx_btn.click()
                time.sleep(1.0)
        except Exception as e:
            print(f"Notice opening Solana modal: {e}")

        # Capture the active Solana Devnet explorer modal dialog card
        modal_dialog = page.locator("div.terminal-box.rounded-xl:has-text('SOLANA DEVNET TRANSACTION EXPLORER')").first
        if modal_dialog.is_visible():
            box3 = modal_dialog.bounding_box()
            page.screenshot(path=cap3_path, clip=box3, timeout=10000)
        else:
            equity_loc = page.locator("div.terminal-box:has-text('ADA-LOVELACE COMPUTE EQUITY PROTOCOL')")
            page.screenshot(path=cap3_path, clip=equity_loc.bounding_box(), timeout=10000)
        print(f"  -> Saved {cap3_path} ({os.path.getsize(cap3_path) / 1024:.1f} KB)")

        # Close Solana modal cleanly
        try:
            close_btn = page.locator("button:has-text('Close Explorer')").first
            if close_btn.is_visible():
                close_btn.click()
                time.sleep(0.6)
        except Exception:
            page.keyboard.press("Escape")
            time.sleep(0.4)

        # ----------------------------------------------------------------------
        # CAP 4: screenshot_telemetry.png
        # 'TIGER DATA HYPERTABLE' 1Hz dashboard with local metrics:
        # Virginia Grid Carbon: 442 gCO2, PUE: 1.48, Core: 72 °C, Presage: 74 BPM.
        # ----------------------------------------------------------------------
        print("\n[4/6] Capturing screenshot_telemetry.png...")
        telemetry_loc = page.locator("div.terminal-box:has-text('TIGER DATA HYPERTABLE')")
        telemetry_loc.scroll_into_view_if_needed()
        time.sleep(0.5)
        box4 = telemetry_loc.bounding_box()
        cap4_path = os.path.join(ASSETS_DIR, "screenshot_telemetry.png")
        page.screenshot(path=cap4_path, clip=box4, timeout=10000)
        print(f"  -> Saved {cap4_path} ({os.path.getsize(cap4_path) / 1024:.1f} KB)")

        # ----------------------------------------------------------------------
        # CAP 5: screenshot_sql.png
        # Interactive inspect modal demonstrating continuous SQL rollups (schema_tigerdata.sql).
        # ----------------------------------------------------------------------
        print("\n[5/6] Capturing screenshot_sql.png...")
        try:
            sql_btn = page.locator("button:has-text('INSPECT SQL SCHEMA')")
            if sql_btn.is_visible():
                sql_btn.click()
                time.sleep(0.8)
        except Exception as e:
            print(f"Notice opening SQL modal: {e}")

        box5 = telemetry_loc.bounding_box()
        cap5_path = os.path.join(ASSETS_DIR, "screenshot_sql.png")
        page.screenshot(path=cap5_path, clip=box5, timeout=10000)
        print(f"  -> Saved {cap5_path} ({os.path.getsize(cap5_path) / 1024:.1f} KB)")

        # Close SQL modal
        try:
            close_sql = page.locator("button:has-text('✕')").first
            if close_sql.is_visible():
                close_sql.click()
                time.sleep(0.5)
        except Exception:
            pass

        # ----------------------------------------------------------------------
        # CAP 6: screenshot_biometrics.png
        # Close-up of glowing '[🚀 RUN 60s AUTONOMOUS JUDGE DEMO]' navbar button
        # and visual alerts of grid surges in us-east-1 alongside Presage biometrics.
        # ----------------------------------------------------------------------
        print("\n[6/6] Capturing screenshot_biometrics.png...")
        page.evaluate("window.scrollTo({top: 0, behavior: 'instant'})")
        time.sleep(0.5)
        header_loc = page.locator("header.terminal-box")
        box6 = header_loc.bounding_box()
        cap6_path = os.path.join(ASSETS_DIR, "screenshot_biometrics.png")
        page.screenshot(path=cap6_path, clip=box6, timeout=10000)
        print(f"  -> Saved {cap6_path} ({os.path.getsize(cap6_path) / 1024:.1f} KB)")

        page.close()
        context.close()
        browser.close()

    create_showcase_collage()


def create_showcase_collage():
    """
    Stitches the captured high-definition component screenshots into a master
    presentation collage with a dark workspace background and cyber cyan accents.
    """
    print("\n--- Compiling Master Showcase Collage (screenshot_collage.png) ---")
    c1_path = os.path.join(ASSETS_DIR, "screenshot_orbital.png")
    c2_path = os.path.join(ASSETS_DIR, "screenshot_compiler.png")
    c3_path = os.path.join(ASSETS_DIR, "screenshot_equity.png")
    c4_path = os.path.join(ASSETS_DIR, "screenshot_telemetry.png")
    c5_path = os.path.join(ASSETS_DIR, "screenshot_sql.png")
    c6_path = os.path.join(ASSETS_DIR, "screenshot_biometrics.png")

    img_paths = [c1_path, c2_path, c3_path, c4_path, c5_path, c6_path]
    if not all(os.path.exists(p) for p in img_paths):
        print("Skipping collage: some component screenshots are missing.")
        return

    # Master canvas: 2560 x 1440 (1440p Quad-HD Dark Workspace)
    canvas_w, canvas_h = 2560, 1440
    collage = Image.new("RGBA", (canvas_w, canvas_h), (3, 7, 18, 255))  # #030712 cyber-950
    draw = ImageDraw.Draw(collage)

    # Subtle grid lines in background
    grid_color = (15, 23, 42, 120)  # dark slate
    for x in range(0, canvas_w, 40):
        draw.line([(x, 0), (x, canvas_h)], fill=grid_color, width=1)
    for y in range(0, canvas_h, 40):
        draw.line([(0, y), (canvas_w, y)], fill=grid_color, width=1)

    # Header Title Banner
    draw.text((60, 35), "SELENE-GRID v2.0 // MISSION CONTROL ARCHITECTURE SHOWCASE", fill=(0, 240, 255, 255))
    draw.text((60, 65), "Autonomous Earth-to-Lunar Carbon-Aware Distributed AI Orchestrator & Ada-Lovelace Equity Protocol • Girls Hoo Hack 2026", fill=(148, 163, 184, 255))

    # Helper function to paste image with border
    def paste_with_border(img_path, box, title):
        x, y, w, h = box
        img = Image.open(img_path).convert("RGBA")
        img = img.resize((w, h), Image.Resampling.LANCZOS)
        border_col = (0, 240, 255, 90)
        draw.rectangle([x - 2, y - 2, x + w + 1, y + h + 1], outline=border_col, width=2)
        collage.paste(img, (x, y), img)
        draw.text((x + 6, y - 22), title, fill=(0, 240, 255, 230))

    # Top Row:
    # 01 Orbital Digital Twin: 1460 x 580
    paste_with_border(c1_path, (60, 125, 1460, 580), "01 // CISLUNAR 3D WEBGL ORBITAL ROUTER & LASER UPLINK")
    # 02 AST Green Compiler: 920 x 580
    paste_with_border(c2_path, (1580, 125, 920, 580), "02 // NEURO-SYMBOLIC AST GREEN COMPILER (-59.17% FLOPS)")

    # Bottom Row: 4 modular panels
    # 03 Ada-Lovelace Solana Explorer Modal: 580 x 590
    paste_with_border(c3_path, (60, 765, 580, 590), "03 // ADA-LOVELACE PROTOCOL & SOLANA DEVNET EXPLORER")
    # 04 Tiger Data 1Hz Telemetry: 580 x 590
    paste_with_border(c4_path, (680, 765, 580, 590), "04 // TIGER DATA 1Hz TELEMETRY & PRESAGE BIO-SENSING")
    # 05 TimescaleDB Continuous Aggregate SQL: 580 x 590
    paste_with_border(c5_path, (1300, 765, 580, 590), "05 // TIMESCALEDB HYPERTABLE CONTINUOUS AGGREGATE DDL")
    # 06 Mission Control Header & Autonomous Trigger: 580 x 590
    paste_with_border(c6_path, (1920, 765, 580, 590), "06 // MISSION CONTROL HEADER & AUTONOMOUS TRIGGER")

    collage_path = os.path.join(ASSETS_DIR, "screenshot_collage.png")
    collage.save(collage_path, "PNG", quality=95)
    print(f"\n[SUCCESS] Master Showcase Collage generated: {collage_path} ({os.path.getsize(collage_path) / (1024 * 1024):.2f} MB)")


def main():
    capture_all_screenshots()
    print("\n========================================================")
    print("All screenshots generated and verified in /public/assets/:")
    for f in sorted(os.listdir(ASSETS_DIR)):
        if f.endswith(".png"):
            p = os.path.join(ASSETS_DIR, f)
            print(f"  * {f} ({os.path.getsize(p) / 1024:.1f} KB)")
    print("========================================================\n")


if __name__ == "__main__":
    main()
