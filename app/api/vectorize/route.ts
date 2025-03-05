import { NextResponse } from 'next/server'
import { Db, Server, PrivateKey } from "@/app/utils/db";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function POST(request: Request) {
  try {
    // Fetch ideas data from the database
    const { data: ideasData, error: ideasError } = await Db
      .from('ideas')
      .select(`
        *,
        address_id!inner (*),
        users!inner (*)
      `).order('created_at', { ascending: false });

    if (ideasError) {
      console.error('Error fetching ideas:', ideasError);
      return NextResponse.json({ error: 'Error fetching ideas' }, { status: 500 });
    }

    // Initialize OpenAI embeddings model
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    // Process each idea to create embeddings
    let successCount = 0;
    let errorCount = 0;

    for (const idea of ideasData) {
      try {
        // Create content to vectorize (combine relevant fields)
        // const contentToVectorize = `${idea.title} ${idea.description || ''}`;
        const contentToVectorize = [
          `Industry: ${idea.industry || ''}`,
          `Title: ${idea.title}`,
          // `Description: ${idea.description || ''}`,
          `${idea.tags}`,
          `Country: ${idea.address_id?.country}`,
          `Suburb: ${idea.address_id?.suburb}`,
          `State: ${idea.address_id?.state}`,
          // `${Array.isArray(idea.tags) ? idea.tags.join(', ') : ''}`,
          // `Location: ${[
          //   idea.address_id?.country,
          //   idea.address_id?.suburb,
          //   idea.address_id?.state,
          // ].filter(Boolean).join(', ')}`,
          `Founder: ${idea.users?.name || ''}`,
          `Email: ${idea.users?.email || ''}`,
        ].filter(Boolean).join(' ').trim();

        console.log('Optimized Content to Vectorize:', contentToVectorize);


        // Generate embedding for the idea
        const [embedding] = await embeddings.embedDocuments([contentToVectorize]);
        console.log('Embedding Generated:', {
          id: idea.id,
          length: embedding.length, // Should be 1536
          sample: embedding.slice(0, 5), // Check first few values
        });

        // Update the idea record with the embedding
        const { error: updateError } = await Db
          .from('ideas')
          .update({ embedding })
          .eq('id', idea.id);

        if (updateError) {
          console.error(`Error updating embedding for idea ${idea.id}:`, updateError);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (ideaError) {
        console.error(`Error processing embedding for idea ${idea.id}:`, ideaError);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${successCount} ideas successfully, ${errorCount} failures`
    }, { status: 200 });
  } catch (error) {
    console.error('Error in vectorize API:', error);
    return NextResponse.json({ error: 'Error processing request' }, { status: 400 });
  }
}

export async function GET() {
  try {
    // Handle your GET request here
    console.log('Received GET request')

    return NextResponse.json({ message: 'GET request successful' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}