import type { IDataObject, IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

/** CSV -> integer IDs for JSON body (OpenAPI: array of integers). */
export function parseCsvToIntArray(raw: string): number[] {
	if (!raw) return [];
	return raw
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item.length > 0)
		.map((item) => Number.parseInt(item, 10))
		.filter((n) => !Number.isNaN(n));
}

function isBusinessSuccess(code: unknown): boolean {
	const n = Number(code);
	return n === 200 || n === 0;
}

export async function socialEchoApiRequest(
	this: IExecuteFunctions,
	path: string,
	body: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('socialEchoApi');
	const baseUrl = String(credentials.baseUrl ?? 'https://api.socialecho.net').replace(/\/$/, '');
	const teamId = String(credentials.teamId ?? '').trim();
	const url = `${baseUrl}${path}`;

	const headers: IDataObject = {};
	if (teamId) {
		headers['X-Team-Id'] = teamId;
	}

	try {
		const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'socialEchoApi', {
			method: 'GET',
			url,
			body,
			headers: Object.keys(headers).length > 0 ? headers : undefined,
			json: true,
			returnFullResponse: true,
			timeout: 60000,
		})) as {
			statusCode?: number;
			body?: IDataObject;
		};

		const statusCode = Number(response.statusCode ?? 200);
		const resBody = (response.body ?? {}) as IDataObject;
		const code = resBody.code;

		if (statusCode !== 200 || !isBusinessSuccess(code)) {
			throw new NodeOperationError(this.getNode(), 'SocialEcho API request failed.', {
				description: `status=${statusCode}, code=${String(code ?? 'undefined')}, message=${String(resBody.message ?? '')}`,
			});
		}

		return resBody;
	} catch (error) {
		if (error instanceof NodeOperationError) {
			throw error;
		}
		const apiErrorPayload =
			error && typeof error === 'object'
				? (error as JsonObject)
				: ({ message: String(error) } as JsonObject);
		throw new NodeApiError(this.getNode(), apiErrorPayload);
	}
}
