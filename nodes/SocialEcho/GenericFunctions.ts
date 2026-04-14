import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export function normalizeAccountIds(raw: string): string {
	return raw
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item.length > 0)
		.join(',');
}

export async function socialEchoApiRequest(
	this: IExecuteFunctions,
	path: string,
	query: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('socialEchoApi');
	const baseUrl = String(credentials.baseUrl ?? 'https://api.socialecho.net').replace(/\/$/, '');
	const teamId = String(credentials.teamId ?? '');
	const url = `${baseUrl}${path}`;
	const headers: IDataObject = {};
	if (teamId) headers['X-Team-Id'] = teamId;

	try {
		const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'socialEchoApi', {
			method: 'GET',
			url,
			qs: query,
			headers: Object.keys(headers).length > 0 ? headers : undefined,
			json: true,
			returnFullResponse: true,
			timeout: 60000,
		})) as {
			statusCode?: number;
			body?: IDataObject;
		};

		const statusCode = Number(response.statusCode ?? 200);
		const body = (response.body ?? {}) as IDataObject;
		const code = Number(body.code ?? 0);

		if (statusCode !== 200 || code !== 200) {
			throw new NodeOperationError(this.getNode(), 'SocialEcho API request failed.', {
				description: `status=${statusCode}, code=${String(body.code ?? 'undefined')}, message=${String(body.message ?? '')}`,
			});
		}

		return body;
	} catch (error) {
		if (error instanceof NodeOperationError) {
			throw error;
		}
		const message = error instanceof Error ? error.message : String(error);
		throw new NodeOperationError(this.getNode(), 'SocialEcho API request failed.', {
			description: message,
		});
	}
}
