import { NextResponse } from 'next/server'; // This replaces NextApiResponse
import { db } from '@/lib/prisma'; // Adjust the path if necessary

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Get the request body
    const {
      bio,
      company,
      businessStage,
      fundingHistory,
      linkedinUrl,
      revenue,
      investmentOpportunities,
      imageUrl,
    } = body;

    const clerkId = req.headers.get('clerk-id') as string;

    if (!clerkId) {
      return NextResponse.json({ error: 'Clerk ID is required' }, { status: 400 });
    }

    const user = await db.user.findFirst({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.entrepreneurProfile.upsert({
      where: { userId: user.id },
      update: {
        bio,
        company,
        businessStage,
        fundingHistory,
        linkedinUrl,
        revenue,
        imageUrl,
        investmentOpportunities: {
          upsert: investmentOpportunities.map((opp: any) => ({
            where: { title: opp.title },
            update: opp,
            create: opp,
          })),
        },
      },
      create: {
        userId: user.id,
        bio,
        company,
        businessStage,
        fundingHistory,
        linkedinUrl,
        revenue,
        imageUrl,
        investmentOpportunities: {
          create: investmentOpportunities,
        },
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export function OPTIONS() {
  // If you want to explicitly handle the OPTIONS method
  return NextResponse.json({}, { status: 200 });
}
