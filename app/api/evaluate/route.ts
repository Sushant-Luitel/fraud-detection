import { NextResponse } from 'next/server';

export interface EvaluationRequest {
  accountId: string;
  accountAgeDays: number;
  recentDepositAmount: number;
  transferOutAmount: number;
  isSuspiciousIP: boolean;
  destinationAccount: string;
}

export interface EvaluationResult {
  id: string;
  timestamp: string;
  accountId: string;
  destinationAccount: string;
  score: number;
  status: 'APPROVED' | 'BLOCKED';
  explanations: string[];
}

// In-memory store (Shared globally in development/single-instance)
const flaggedTransactions: EvaluationResult[] = [];

export async function POST(request: Request) {
  try {
    const data: EvaluationRequest = await request.json();
    
    let score = 0;
    const explanations: string[] = [];

    // Rule 1: Account Age & Deposit Anomaly (Dynamic)
    if (data.accountAgeDays < 30) {
      // Risk factor based on age (newer = higher risk)
      const ageFactor = (30 - data.accountAgeDays) / 30;
      // Risk factor based on deposit amount
      const depositFactor = Math.min(data.recentDepositAmount / 100000, 2);
      
      const rule1Score = Math.round(25 * ageFactor * depositFactor);
      if (rule1Score > 0) {
        score += rule1Score;
        explanations.push(`+${rule1Score}: High deposit volume on a new/dormant account (${data.accountAgeDays} days old)`);
      }
    }

    // Rule 2: Pass-Through Velocity (Dynamic)
    if (data.recentDepositAmount > 0) {
      const velocity = data.transferOutAmount / data.recentDepositAmount;
      if (velocity >= 0.4) {
        // Scale from 0 to 50 based on velocity (40% to 100%)
        const velocityFactor = Math.min((velocity - 0.4) / 0.6, 1);
        const rule2Score = Math.round(50 * velocityFactor);
        
        if (rule2Score > 0) {
          score += rule2Score;
          explanations.push(`+${rule2Score}: High cash-out velocity (${Math.round(velocity * 100)}% of recent funds)`);
        }
      }
    }

    // Rule 3: Device/IP Anomaly
    if (data.isSuspiciousIP) {
      score += 25;
      explanations.push('+25: Connection originated from flagged multi-login IP address');
    }

    // Decision Logic
    const status = score >= 75 ? 'BLOCKED' : 'APPROVED';

    const result: EvaluationResult = {
      id: Math.random().toString(36).substring(2, 15).toUpperCase(),
      timestamp: new Date().toISOString(),
      accountId: data.accountId,
      destinationAccount: data.destinationAccount,
      score,
      status,
      explanations
    };

    // Store in-memory if blocked
    if (status === 'BLOCKED') {
      flaggedTransactions.unshift(result);
      
      // Keep only recent 50 to avoid memory leak in long running process
      if (flaggedTransactions.length > 50) {
        flaggedTransactions.pop();
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(flaggedTransactions);
}

export async function DELETE() {
  flaggedTransactions.length = 0;
  return NextResponse.json({ message: 'Cleared all alerts' });
}
