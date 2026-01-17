import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get OnSpace AI credentials from environment
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!apiKey || !baseUrl) {
      console.error('Missing OnSpace AI credentials');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call OnSpace AI
    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are LiftBot, an AI tutor designed to help Nigerian students prepare for WAEC, NECO, GCE, JAMB, and POST-UTME exams.

Your responsibilities:
- Explain difficult concepts in simple terms
- Generate practice questions with answers
- Provide study tips and exam strategies
- Break down complex topics into digestible parts
- Encourage and motivate students
- Use Nigerian English and context

Guidelines:
- Be friendly, encouraging, and supportive
- Use clear, simple language
- Provide specific examples relevant to Nigerian curriculum
- When explaining, use step-by-step approaches
- For practice questions, always include the correct answer and explanation
- Focus on understanding, not just memorization
- Relate topics to real-world Nigerian examples when possible

You're helping students succeed in their exams and build a strong foundation for their future.`
          },
          {
            role: 'user',
            content: message
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OnSpace AI error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        {
          status: aiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await aiResponse.json();
    const response = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('LiftBot error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
