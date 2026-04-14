import type { ICredentialType, INodeProperties } from 'n8n-workflow';

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
			description: 'Use https://api-dev.socialecho.net for dev environment',
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
			description: 'Optional. Set if your API key can access multiple teams',
		},
	];

	authenticate = {
		type: 'generic' as const,
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'X-Lang': '={{$credentials.lang}}',
				'X-Team-Id': '={{$credentials.teamId}}',
			},
		},
	};

	test = {
		request: {
			url: '={{$credentials.baseUrl}}/v1/team',
			method: 'GET' as const,
		},
		rules: [
			{
				type: 'responseCode' as const,
				properties: {
					value: 200,
					message: 'SocialEcho API returned a non-200 HTTP status.',
				},
			},
		],
	};
}
