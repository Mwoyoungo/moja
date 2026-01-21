import Mux from '@mux/mux-node';
import { NextResponse } from 'next/server';

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    try {
        const upload = await mux.video.uploads.retrieve(id);
        console.log("Mux Upload Status:", upload.status, upload.asset_id);

        if (upload.asset_id) {
            const asset = await mux.video.assets.retrieve(upload.asset_id);
            const playbackId = asset.playback_ids?.[0]?.id;

            return NextResponse.json({
                status: upload.status,
                assetId: upload.asset_id,
                playbackId: playbackId,
            });
        }

        return NextResponse.json({
            status: upload.status,
            assetId: null,
        });

    } catch (error) {
        console.error('Error fetching Mux upload:', error);
        return NextResponse.json(
            { error: 'Error fetching upload status' },
            { status: 500 }
        );
    }
}
