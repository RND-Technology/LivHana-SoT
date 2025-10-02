import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ApiResponse, UserProfile } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        missions: {
          where: { completed: true },
          select: { id: true },
        },
        orders: {
          where: { status: 'COMPLETED' },
          select: { id: true },
        },
        petitions: {
          select: { id: true },
        },
        raffleEntries: {
          select: { id: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const userProfile: UserProfile = {
      ...user,
      missionsCompleted: user.missions.length,
      ordersCompleted: user.orders.length,
      petitionsSigned: user.petitions.length,
      raffleEntries: user.raffleEntries.length,
    }

    return NextResponse.json<ApiResponse<UserProfile>>({
      success: true,
      data: userProfile,
    })
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.firstName || !body.lastName || !body.dateOfBirth) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        phone: body.phone,
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        ageVerified: body.ageVerified || false,
        ageVerifiedAt: body.ageVerified ? new Date() : undefined,
      },
    })

    return NextResponse.json<ApiResponse<typeof user>>({
      success: true,
      data: user,
      message: 'User created successfully',
    })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
