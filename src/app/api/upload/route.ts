import { NextRequest, NextResponse } from 'next/server';
import documentProcessingService from '@/services/documentProcessingService';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const sessionId = formData.get("sessionId");
        
        if (!file) {
            return NextResponse.json({
                error: "No files received."
            }, { status: 400 });
        }

        if (!sessionId) {
            return NextResponse.json({
                error: "Session ID is required."
            }, { status: 400 });
        }

        // Process document through the complete pipeline
        const result = await documentProcessingService.processDocument(
            file as File, 
            sessionId as string
        );

        if (!result.success) {
            return NextResponse.json({
                status: "error",
                message: result.error || "Document processing failed"
            }, { status: 500 });
        }

        return NextResponse.json({
            status: "success",
            message: "Document processed successfully",
            data: {
                documentId: result.documentId,
                documentName: result.documentName,
                summary: result.summary,
                topics: result.topics
            }
        });
        
    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json({
            status: "error",
            message: "Internal server error during document processing"
        }, { status: 500 });
    }
}