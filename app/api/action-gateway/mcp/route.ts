export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { listMcpTools, handleMcpToolCall, McpCallContext } from '@/lib/mcp/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== '2.0') {
      return NextResponse.json(
        { jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid Request: jsonrpc version must be 2.0' } },
        { status: 400 }
      );
    }

    // 1. Tool discovery
    if (method === 'tools/list') {
      const tools = listMcpTools();
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: { tools },
      });
    }

    // 2. Tool invocation
    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};
      
      const tenantHeader = req.headers.get('x-vaulthost-tenant') || 'tenant_default_sandbox';
      const actorHeader = req.headers.get('x-vaulthost-actor') || 'ai_agent_assistant';
      const delegationToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

      const context: McpCallContext = {
        tenantId: tenantHeader,
        actorId: actorHeader,
        actorType: 'ai_agent',
        delegationToken: delegationToken || 'del_sandbox_session_active_token',
        clientIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
      };

      const { result, error } = await handleMcpToolCall(toolName, args, context);

      if (error) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: error },
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          isError: result?.status === 'rejected',
        },
      });
    }

    return NextResponse.json(
      { jsonrpc: '2.0', id, error: { code: -32601, message: `Method '${method}' not found` } },
      { status: 404 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal MCP server error';
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message } },
      { status: 500 }
    );
  }
}
