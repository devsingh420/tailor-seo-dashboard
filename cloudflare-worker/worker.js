/**
 * Stitch Intelligence - Content Generator Worker
 * Deploy to Cloudflare Workers
 *
 * Environment Variables needed:
 * - OPENAI_API_KEY: Your OpenAI API key
 */

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { topic, category, platform } = await request.json();

      if (!topic || !platform) {
        return new Response(JSON.stringify({ error: 'Missing topic or platform' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const platformSpecs = {
        linkedin: {
          tone: 'professional, authoritative, thought-leadership',
          length: '200-250 words',
          style: 'Start with a hook or insight. Use line breaks. Include 3-4 key points with emojis as bullets. End with a question or CTA.',
          hashtags: 5
        },
        instagram: {
          tone: 'aspirational, stylish, engaging, use emojis throughout',
          length: '100-150 words',
          style: 'Punchy opening line. Short sentences. Lifestyle focused. Aspirational but relatable.',
          hashtags: 20
        },
        facebook: {
          tone: 'conversational, engaging, shareable',
          length: '150-200 words',
          style: 'Personal angle. Ask questions. Encourage comments and shares. Friendly but knowledgeable.',
          hashtags: 3
        },
        blog: {
          tone: 'informative, SEO-optimized, authoritative',
          length: '400-500 words',
          style: 'Use markdown. Include H2 headers. Opening hook, 3 main sections, conclusion with CTA.',
          hashtags: 5
        }
      };

      const spec = platformSpecs[platform];

      const systemPrompt = `You are a luxury men's lifestyle content creator for "Stitch Intelligence" - a premium bespoke tailoring brand in Bangkok, Thailand.

Your expertise covers:
- Bespoke suits and tailoring
- Luxury watches (Rolex, Patek Philippe, Omega, etc.)
- Designer shoes and leather goods
- Accessories (ties, cufflinks, pocket squares)
- Luxury automobiles
- Premium gadgets and tech

Brand voice: Sophisticated, knowledgeable, aspirational but approachable. You educate while inspiring.

Target audience: Business professionals, executives, entrepreneurs, and style-conscious men who appreciate quality craftsmanship.`;

      const userPrompt = `Create a ${platform.toUpperCase()} post about this trending topic:

"${topic}"

Category: ${category || 'Luxury Lifestyle'}

Requirements:
- Tone: ${spec.tone}
- Length: ${spec.length}
- Style: ${spec.style}
- Include ${spec.hashtags} relevant hashtags at the end
- Make it timely and relevant to current trends
- Subtly connect to bespoke tailoring/men's style when natural
- DO NOT use generic filler - be specific and insightful

Return ONLY the post content followed by hashtags. No labels or explanations.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.85
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI Error:', error);
        return new Response(JSON.stringify({ error: 'AI generation failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse content and hashtags
      const hashtagMatch = content.match(/#[\w]+/g) || [];
      const text = content.replace(/#[\w]+/g, '').trim();

      return new Response(JSON.stringify({
        text,
        hashtags: hashtagMatch.join(' '),
        platform,
        topic
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
