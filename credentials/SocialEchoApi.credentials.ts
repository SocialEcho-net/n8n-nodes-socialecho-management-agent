import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SocialEchoApi implements ICredentialType {
	name = 'socialEchoApi';

	displayName = 'SocialEcho API';

	documentationUrl = 'https://github.com/SocialEcho-net/social-media-autopilot';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.socialecho.net',
			description: 'Production API host (default). Change only if you use a custom endpoint.',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Team API Key created from SocialEcho team management',
		},
		{
			displayName: 'Language',
			name: 'lang',
			type: 'options',
			options: [
				{ name: 'zh_CN', value: 'zh_CN' },
				{ name: 'en', value: 'en' },
			],
			default: 'zh_CN',
		},
		{
			displayName: 'Team ID',
			name: 'teamId',
			type: 'string',
			default: '',
			description:
				'Optional. If set, sent as X-Team-Id. Leave empty to use the team implied by the API key.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic' as const,
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'X-Lang': '={{$credentials.lang}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/team',
			method: 'GET' as const,
			body: {},
			json: true,
		},
	};
}
