/**
 * Stitch Intelligence - Content Generator Worker
 * Uses OpenAI GPT-4o-mini
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

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
          style: 'Start with a compelling hook. Use line breaks. Include 3-4 key insights with emoji bullets. End with a question or CTA.',
          hashtags: 5
        },
        instagram: {
          tone: 'aspirational, stylish, engaging with emojis',
          length: '100-150 words',
          style: 'Punchy opening. Short sentences. Lifestyle-focused. Use emojis naturally.',
          hashtags: 20
        },
        facebook: {
          tone: 'conversational, engaging, shareable',
          length: '150-200 words',
          style: 'Personal angle. Ask questions. Encourage comments. Friendly but knowledgeable.',
          hashtags: 3
        },
        blog: {
          tone: 'informative, SEO-optimized, authoritative',
          length: '400-500 words',
          style: 'Use markdown. H1 title, engaging intro, 2-3 H2 sections, conclusion with CTA.',
          hashtags: 5
        }
      };

      const spec = platformSpecs[platform];

      const systemPrompt = `You are the content creator for "Stitch Intelligence" - a premium bespoke tailoring brand in Bangkok, Thailand.

Your expertise: bespoke suits, luxury watches (Rolex, Patek Philippe, Omega), designer shoes, accessories (ties, cufflinks), luxury cars, premium gadgets.

Brand voice: Sophisticated, knowledgeable, aspirational yet approachable.

Target audience: Business professionals, executives, entrepreneurs, style-conscious men 30-55.`;

      const userPrompt = `Create a ${platform.toUpperCase()} post about: "${topic}"

Category: ${category || 'Luxury Lifestyle'}

Requirements:
- Tone: ${spec.tone}
- Length: ${spec.length}
- Style: ${spec.style}
- Include ${spec.hashtags} hashtags at the end
- Be specific and insightful, not generic

Return ONLY the post content with hashtags. No labels or explanations.`;

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
          max_tokens: 1024,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI Error:', error);
        return new Response(JSON.stringify({ error: 'AI generation failed', details: error }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

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
