import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Visitor from '@/models/Visitor';

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();

    // Find existing visitor
    let visitor = await Visitor.findOne({ visitorId: data.visitorId });

    if (visitor) {
      // Update existing visitor
      visitor.lastVisit = Date.now();
      visitor.visitCount += 1;
      await visitor.save();
    } else {
      // Create new visitor
      visitor = await Visitor.create({
        ...data,
        lastVisit: Date.now(),
        visitCount: 1,
      });
    }

    return NextResponse.json(visitor);
  } catch (error) {
    console.error('Error saving visitor data:', error);
    return NextResponse.json(
      { error: 'Failed to save visitor data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    // Get analytics data
    const [
      totalVisitors,
      uniqueVisitors,
      recentVisitors,
      topCountries,
      topBrowsers,
    ] = await Promise.all([
      // Total visitors
      Visitor.countDocuments(),
      
      // Unique visitors
      Visitor.distinct('visitorId').then(ids => ids.length),
      
      // Recent visitors
      Visitor.find()
        .sort({ lastVisit: -1 })
        .limit(5),
      
      // Top countries
      Visitor.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { country: '$_id', count: 1, _id: 0 } },
      ]),
      
      // Top browsers
      Visitor.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { browser: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    // Get hourly visitors for the last 24 hours
    const hourlyVisitors = await Visitor.aggregate([
      {
        $match: {
          lastVisit: { $gte: Date.now() - 24 * 60 * 60 * 1000 }
        }
      },
      {
        $group: {
          _id: { $hour: { $toDate: '$lastVisit' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { hour: '$_id', count: 1, _id: 0 } }
    ]);

    return NextResponse.json({
      totalVisitors,
      uniqueVisitors,
      activeVisitors: await Visitor.countDocuments({
        lastVisit: { $gte: Date.now() - 5 * 60 * 1000 } // Active in last 5 minutes
      }),
      recentVisitors,
      topCountries,
      topBrowsers,
      hourlyVisitors,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 