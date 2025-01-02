
export async function GET() {
    // Mock data - replace this with real database queries
    const subscribersData = [
      { month: '23 Decem', count: 0 },
      { month: '27 Decem', count: 5 },
      { month: '31 Decem', count: 7 },
      { month: '4 Jan', count: 14 },
    ];
    
    return new Response(JSON.stringify(subscribersData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }
  