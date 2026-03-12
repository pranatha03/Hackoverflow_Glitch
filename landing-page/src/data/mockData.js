// Mock data for ASTRO_SENTINEL

export const mockAlerts = [
    {
        id: "NEO-2024-X9",
        title: "NEO Proximity Alert",
        subtitle: "Near-Earth Asteroid",
        detail: "Object 99942 Apophis",
        category: "NEO",
        severity: "critical",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        source: "NASA CNEOS",
        summary: "Object 99942 Apophis was observed in a near-earth approach trajectory. Spectroscopic analysis suggests a silicate-type asteroid. Sentinel array 4 has been tasked with continuous tracking until Earth-MOID minimum distance is achieved.",
        magnitude: "31,000 km (L-Dist)",
        metrics: [
            { key: "Current Coordinates", value: "RA 14h 22m 1s | Dec -15°" },
            { key: "Velocity", value: "30.73 km/s" },
            { key: "Source Sensor", value: "Palomar ZTF-04" },
            { key: "Impact Prob.", value: "0.00041%" },
            { key: "Velocity", value: "42,500 km/h" },
            { key: "Magnitude", value: "18.42 H" },
            { key: "Impact Prob.", value: "0.0024%" },
            { key: "Estimated Size", value: "120m – 280m" },
        ],
        coords: { ra: "14h 21m 32s", dec: "+23° 11′ 14″", dist: "0.042 AU" },
        links: [{ label: "NASA CNEOS Detail", url: "#" }, { label: "JPL SSD", url: "#" }],
        objectId: "2023-XB",
        node: "VOYAGER-02",
    },
    {
        id: "SOL-2024-F4",
        title: "Solar Flare Activity",
        subtitle: "Solar Flare (X-Class)",
        detail: "AR3664 Region",
        category: "Solar",
        severity: "high",
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        source: "NOAA SWPC",
        summary: "C-class flare detected. Potential satellite interference in lower orbit. The AR3664 active region has produced significant M-class flares this cycle.",
        magnitude: "Intensity X2.4",
        metrics: [
            { key: "Peak Flux", value: "2.4 × 10⁻⁴ W/m²" },
            { key: "Kp Index", value: "7" },
            { key: "Storm Level", value: "G3 (Strong)" },
        ],
        coords: null,
        links: [{ label: "NOAA SWPC Report", url: "#" }],
        objectId: null,
        node: "SOLAR-WATCH-01",
    },
    {
        id: "ISS-2024-C2",
        title: "Conjunction Warning",
        subtitle: "ISS Conjunction Warning",
        detail: "Debris Tracking: COSMOS 1408",
        category: "ISS",
        severity: "medium",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        source: "18th Space Control Sqn",
        summary: "Fragment 88-21C closing on ISS within 5km radius buffer. Maneuver analysis underway.",
        magnitude: "Miss distance: 1.2 km",
        metrics: [
            { key: "Miss Distance", value: "1.2 km" },
            { key: "TCA", value: "T+02:14:00" },
            { key: "Debris Source", value: "COSMOS 1408" },
        ],
        coords: null,
        links: [{ label: "Space-Track CDM", url: "#" }],
        objectId: null,
        node: "ISS-TRACK-03",
    },
    {
        id: "DEB-2024-M1",
        title: "SpaceX Starlink Launch",
        subtitle: "Atmospheric Re-entry",
        detail: "Starlink-4322 Decay",
        category: "Launch",
        severity: "low",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        source: "SpaceX",
        summary: "Scheduled deployment of 22 satellites from SLC-40 successful. All payloads in target orbit.",
        magnitude: "Pacific Ocean South",
        metrics: [
            { key: "Orbit Altitude", value: "550 km" },
            { key: "Satellites", value: "22" },
            { key: "Status", value: "Nominal" },
        ],
        coords: null,
        links: [{ label: "SpaceX Launch Page", url: "#" }],
        objectId: null,
        node: "LAUNCH-NET-02",
    },
    {
        id: "NEO-2024-A3",
        title: "NEO Close Approach",
        subtitle: "Asteroid 2024 BX1",
        detail: "Near-Earth Fly-by",
        category: "NEO",
        severity: "medium",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        source: "ESA NEO Coordination",
        summary: "Asteroid 2024 BX1 will make a close approach within lunar distance. No impact risk assessed.",
        magnitude: "380,000 km",
        metrics: [
            { key: "Approach Distance", value: "0.99 LD" },
            { key: "Velocity", value: "22.1 km/s" },
            { key: "Diameter", value: "~3m" },
        ],
        coords: null,
        links: [{ label: "ESA NEOCC", url: "#" }],
        objectId: null,
        node: "ESA-WATCH-07",
    },
    {
        id: "SOL-2024-G1",
        title: "Geomagnetic Storm",
        subtitle: "G2-Class Storm",
        detail: "CME Impact",
        category: "Solar",
        severity: "high",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        source: "NOAA SWPC",
        summary: "Coronal mass ejection impact causing G2-class geomagnetic storm. HF radio blackouts possible at high latitudes.",
        magnitude: "Kp=6",
        metrics: [
            { key: "Storm Class", value: "G2 Moderate" },
            { key: "Kp Index", value: "6" },
            { key: "Duration", value: "~12h" },
        ],
        coords: null,
        links: [{ label: "SWPC 3-Day Forecast", url: "#" }],
        objectId: null,
        node: "SOLAR-WATCH-02",
    },
    {
        id: "DEB-2024-R5",
        title: "Debris Field Alert",
        subtitle: "Orbital Debris Warning",
        detail: "Fengyun-1C Fragment",
        category: "ISS",
        severity: "low",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: "LeoLabs",
        summary: "Trackable debris fragments from Fengyun-1C event crossing high-inclination orbits.",
        magnitude: "Closest: 8.4 km",
        metrics: [
            { key: "Number of fragments", value: "3,000+" },
            { key: "Altitude range", value: "200–860 km" },
            { key: "Risk level", value: "Low" },
        ],
        coords: null,
        links: [{ label: "LeoLabs Report", url: "#" }],
        objectId: null,
        node: "LEO-TRACK-12",
    },
    {
        id: "LAUNCH-2024-S9",
        title: "Artemis II Update",
        subtitle: "Mission Status Change",
        detail: "NASA Artemis Program",
        category: "DeepSpace",
        severity: "low",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: "NASA",
        summary: "Artemis II crew module integration complete. Launch window scheduled for 2024 Q4.",
        magnitude: "Launch: T-90 days",
        metrics: [
            { key: "Mission Phase", value: "Integration" },
            { key: "Crew", value: "4 astronauts" },
            { key: "Target Orbit", value: "Lunar flyby" },
        ],
        coords: null,
        links: [{ label: "NASA Artemis Page", url: "#" }],
        objectId: null,
        node: "NASA-CEN-01",
    },
];

export const eventTimelineData = [
    { time: "00:00", events: 2 },
    { time: "02:00", events: 1 },
    { time: "04:00", events: 3 },
    { time: "06:00", events: 5 },
    { time: "08:00", events: 4 },
    { time: "10:00", events: 7 },
    { time: "12:00", events: 9 },
    { time: "14:00", events: 6 },
    { time: "16:00", events: 11 },
    { time: "18:00", events: 8 },
    { time: "20:00", events: 4 },
    { time: "22:00", events: 3 },
];

export const categoryData = [
    { name: "NEO", value: 6, color: "#f97316" },
    { name: "Solar", value: 3, color: "#8b5cf6" },
    { name: "Launch", value: 2, color: "#00d4ff" },
    { name: "Other", value: 1, color: "#6b7280" },
];

export const kpiData = {
    activeAlerts: 12,
    objectsTracked: 1402,
    eventsToday: 5,
    dataSources: "NASA, ESA",
};

export const severityConfig = {
    critical: { color: "#ef4444", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", dot: "#ef4444", label: "Critical" },
    high: { color: "#f97316", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", dot: "#f97316", label: "High" },
    medium: { color: "#f59e0b", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", dot: "#f59e0b", label: "Medium" },
    low: { color: "#6b7280", bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30", dot: "#6b7280", label: "Low" },
};

export const categoryColors = {
    NEO: "#f97316",
    Solar: "#8b5cf6",
    Launch: "#00d4ff",
    ISS: "#10b981",
    DeepSpace: "#3b82f6",
    Other: "#6b7280",
};

export function timeAgo(isoString) {
    const now = Date.now();
    const diff = now - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}
