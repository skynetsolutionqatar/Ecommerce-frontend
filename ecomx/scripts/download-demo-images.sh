#!/usr/bin/env bash
# IT / hardware / software demo images from Unsplash (no nature — saved locally)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMG="$ROOT/public/images"
UA="Mozilla/5.0 (compatible; SkynetStore/1.0)"

download() {
  local photo_id="$1"
  local w="$2"
  local out="$3"
  mkdir -p "$(dirname "$out")"
  curl -sL -A "$UA" \
    "https://images.unsplash.com/${photo_id}?w=${w}&q=85&auto=format&fit=crop" \
    -o "$out"
  if ! file "$out" | grep -qiE 'image|jpeg|png|webp'; then
    echo "Failed: $out" >&2
    return 1
  fi
  echo "OK $out"
}

# ── Hero banners (servers, networking, laptops, CCTV) ─────────────────────────
download "photo-1558494949-ef0d38d3f7d7" 1600 "$IMG/hero/slide-1.jpg"   # server room
download "photo-1544197150-b99a580bb7a8" 1600 "$IMG/hero/slide-2.jpg"   # networking cables
download "photo-1496181133206-80ce9b88a853" 1600 "$IMG/hero/slide-3.jpg" # laptop workspace
download "photo-1557597774-9d273605dfa9" 1600 "$IMG/hero/slide-4.jpg"   # security camera

# ── Categories ───────────────────────────────────────────────────────────────
download "photo-1560757999-0f2a8366e6dd" 800 "$IMG/categories/servers.jpg"      # data center
download "photo-1544197150-b99a580bb7a8" 800 "$IMG/categories/networking.jpg"
download "photo-1496181133206-80ce9b88a853" 800 "$IMG/categories/laptops.jpg"
download "photo-1556742502-ec7c0e9f34b1" 800 "$IMG/categories/pos.jpg"          # POS terminal
download "photo-1612815154858-60aa4c59eaa6" 800 "$IMG/categories/printers.jpg"  # label printer
download "photo-1557597774-9d273605dfa9" 800 "$IMG/categories/cctv.jpg"
download "photo-1622445275576-721325763afe" 800 "$IMG/categories/ups.jpg"       # power / UPS
download "photo-1607522370275-f6fd21f7a10f" 800 "$IMG/categories/scanners.jpg"   # barcode scanner
download "photo-1527443224154-c4a3942d3acf" 800 "$IMG/categories/displays.jpg"    # monitors
download "photo-1556742049-0cfed4f6a45d" 800 "$IMG/categories/pos-systems.jpg"    # card payment
download "photo-1612298498547-b4e9975a83be" 800 "$IMG/categories/printers-grid.jpg"
download "photo-1563013544-824ae1b704d3" 800 "$IMG/categories/scanners-grid.jpg"  # mobile POS
download "photo-1526374965328-7f61d4dc18c5" 800 "$IMG/categories/displays-grid.jpg" # laptop code
download "photo-1551288049-bebda4e38f71" 800 "$IMG/categories/software.jpg"      # analytics dashboard
download "photo-1558002038-1055907df827" 800 "$IMG/categories/security.jpg"     # smart lock / access

# ── Products (main + alt gallery) ────────────────────────────────────────────
download "photo-1581092580497-e0d23cbdf1dc" 900 "$IMG/products/honeywell-pc42t-label-printer.jpg"
download "photo-1612815154858-60aa4c59eaa6" 900 "$IMG/products/honeywell-pc42t-label-printer-alt.jpg"

download "photo-1563013544-824ae1b704d3" 900 "$IMG/products/zebra-tc22-mobile-computer.jpg"
download "photo-1556742502-ec7c0e9f34b1" 900 "$IMG/products/zebra-tc22-mobile-computer-alt.jpg"

download "photo-1607522370275-f6fd21f7a10f" 900 "$IMG/products/datalogic-magellan-3450vsi.jpg"
download "photo-1556742049-0cfed4f6a45d" 900 "$IMG/products/datalogic-magellan-3450vsi-alt.jpg"

download "photo-1558002038-1055907df827" 900 "$IMG/products/zkteco-f18-attendance.jpg"
download "photo-1518770660439-4636190af475" 900 "$IMG/products/zkteco-f18-attendance-alt.jpg"  # circuit board

download "photo-1622445275576-721325763afe" 900 "$IMG/products/ups-1500va-online.jpg"
download "photo-1581092334651-ddf26d9a09d0" 900 "$IMG/products/ups-1500va-online-alt.jpg"    # industrial tech

download "photo-1551288049-bebda4e38f71" 900 "$IMG/products/atacc-restaurant-pos.jpg"
download "photo-1460925895917-afdab827c52f" 900 "$IMG/products/atacc-restaurant-pos-alt.jpg"  # ERP dashboard

download "photo-1557597774-9d273605dfa9" 900 "$IMG/products/cctv-kit-8-channel.jpg"
download "photo-1580587771525-78b9dba3b914" 900 "$IMG/products/cctv-kit-8-channel-alt.jpg"   # server rack

download "photo-1558494949-ef0d38d3f7d7" 900 "$IMG/products/synology-ds223-nas.jpg"
download "photo-1560757999-0f2a8366e6dd" 900 "$IMG/products/synology-ds223-nas-alt.jpg"

download "photo-1527443224154-c4a3942d3acf" 900 "$IMG/products/partnertech-cd7220-display.jpg"
download "photo-1526374965328-7f61d4dc18c5" 900 "$IMG/products/partnertech-cd7220-display-alt.jpg"

download "photo-1612298498547-b4e9975a83be" 900 "$IMG/products/star-micronics-mc-print3.jpg"
download "photo-1581092580497-e0d23cbdf1dc" 900 "$IMG/products/star-micronics-mc-print3-alt.jpg"

echo "Done — Unsplash IT/hardware images saved under public/images/"
