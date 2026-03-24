// Vercel Serverless Function: /api/calendar
// Fetches Airbnb iCal feed and returns booked periods as JSON
// Set AIRBNB_ICAL_URL as a Vercel environment variable

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600'); // 30 min cache

    const icalUrl = process.env.AIRBNB_ICAL_URL;

    if (!icalUrl) {
        // Return mock data when no iCal URL is configured
        return res.status(200).json({
            mock: true,
            booked: generateMockBookings()
        });
    }

    try {
        const response = await fetch(icalUrl);
        if (!response.ok) {
            throw new Error(`iCal fetch failed: ${response.status}`);
        }

        const icalText = await response.text();
        const booked = parseIcal(icalText);

        return res.status(200).json({ mock: false, booked });
    } catch (error) {
        console.error('Calendar API error:', error);
        return res.status(500).json({ error: 'Kon beschikbaarheid niet ophalen.' });
    }
}

function parseIcal(text) {
    const events = [];
    const lines = text.replace(/\r\n /g, '').split(/\r?\n/);
    let inEvent = false;
    let start = null;
    let end = null;
    let summary = '';

    for (const line of lines) {
        if (line === 'BEGIN:VEVENT') {
            inEvent = true;
            start = null;
            end = null;
            summary = '';
        } else if (line === 'END:VEVENT') {
            if (inEvent && start && end) {
                events.push({ start, end, summary });
            }
            inEvent = false;
        } else if (inEvent) {
            if (line.startsWith('DTSTART')) {
                start = parseIcalDate(line);
            } else if (line.startsWith('DTEND')) {
                end = parseIcalDate(line);
            } else if (line.startsWith('SUMMARY:')) {
                summary = line.substring(8);
            }
        }
    }

    return events;
}

function parseIcalDate(line) {
    // Handles DTSTART;VALUE=DATE:20260410 and DTSTART:20260410T120000Z
    const match = line.match(/(\d{4})(\d{2})(\d{2})/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return null;
}

function generateMockBookings() {
    const now = new Date();
    const bookings = [];

    // Generate realistic-looking mock bookings for the next 4 months
    const mockRanges = [
        { offsetDays: 3, duration: 4 },
        { offsetDays: 14, duration: 7 },
        { offsetDays: 30, duration: 3 },
        { offsetDays: 42, duration: 5 },
        { offsetDays: 58, duration: 7 },
        { offsetDays: 75, duration: 4 },
        { offsetDays: 90, duration: 6 },
        { offsetDays: 105, duration: 3 },
    ];

    for (const range of mockRanges) {
        const start = new Date(now);
        start.setDate(start.getDate() + range.offsetDays);
        const end = new Date(start);
        end.setDate(end.getDate() + range.duration);

        bookings.push({
            start: formatDate(start),
            end: formatDate(end),
            summary: 'Gereserveerd'
        });
    }

    return bookings;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}
