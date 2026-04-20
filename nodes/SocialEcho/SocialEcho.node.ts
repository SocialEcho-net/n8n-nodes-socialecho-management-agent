import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { parseCsvToIntArray, socialEchoApiRequest } from './GenericFunctions';

export class SocialEcho implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SocialEcho',
		name: 'socialEcho',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Call SocialEcho external APIs for team/account/article/report (GET with JSON body per current OpenAPI)',
		defaults: {
			name: 'SocialEcho',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'socialEchoApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Team',
						value: 'getTeam',
						description: 'Get current team information (GET /v1/team)',
						action: 'Get team',
					},
					{
						name: 'List Accounts',
						value: 'listAccounts',
						description: 'List social media accounts (GET /v1/account)',
						action: 'List accounts',
					},
					{
						name: 'List Articles',
						value: 'listArticles',
						description: 'List post/article data (GET /v1/article)',
						action: 'List articles',
					},
					{
						name: 'Get Report',
						value: 'getReport',
						description: 'Get report data by date range (GET /v1/report)',
						action: 'Get report',
					},
				],
				default: 'getTeam',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Pagination page number',
				displayOptions: {
					show: {
						operation: ['listAccounts', 'listArticles'],
					},
				},
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'number',
				default: 1,
				description: 'Account type: 1 = authorized account, 2 = competitor',
				displayOptions: {
					show: {
						operation: ['listAccounts'],
					},
				},
			},
			{
				displayName: 'Account IDs',
				name: 'accountIds',
				type: 'string',
				default: '',
				placeholder: '163956,163955,28',
				description: 'Optional comma-separated account IDs (sent as integer array in JSON body)',
				displayOptions: {
					show: {
						operation: ['listArticles', 'getReport'],
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				placeholder: '2026-01-01',
				description: 'Start date (YYYY-MM-DD)',
				required: true,
				displayOptions: {
					show: {
						operation: ['getReport'],
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				placeholder: '2026-03-24',
				description: 'End date (YYYY-MM-DD)',
				required: true,
				displayOptions: {
					show: {
						operation: ['getReport'],
					},
				},
			},
			{
				displayName: 'Time Type',
				name: 'timeType',
				type: 'number',
				default: 1,
				description: '1 = new posts in range, 2 = all historical posts in range',
				displayOptions: {
					show: {
						operation: ['getReport'],
					},
				},
			},
			{
				displayName: 'Group',
				name: 'group',
				type: 'string',
				default: '',
				description: 'Optional: empty for totals, or day / app / account',
				displayOptions: {
					show: {
						operation: ['getReport'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i += 1) {
			const operation = this.getNodeParameter('operation', i) as string;
			let path = '/v1/team';
			let body: IDataObject = {};

			if (operation === 'getTeam') {
				path = '/v1/team';
				body = {};
			}

			if (operation === 'listAccounts') {
				path = '/v1/account';
				body = {
					page: this.getNodeParameter('page', i) as number,
					type: this.getNodeParameter('type', i) as number,
				};
			}

			if (operation === 'listArticles') {
				path = '/v1/article';
				body = {
					page: this.getNodeParameter('page', i) as number,
				};
				const ids = parseCsvToIntArray((this.getNodeParameter('accountIds', i, '') as string) || '');
				if (ids.length > 0) {
					body.account_ids = ids;
				}
			}

			if (operation === 'getReport') {
				path = '/v1/report';
				body = {
					start_date: this.getNodeParameter('startDate', i) as string,
					end_date: this.getNodeParameter('endDate', i) as string,
					time_type: this.getNodeParameter('timeType', i) as number,
					group: this.getNodeParameter('group', i, '') as string,
				};
				const ids = parseCsvToIntArray((this.getNodeParameter('accountIds', i, '') as string) || '');
				if (ids.length > 0) {
					body.account_ids = ids;
				}
			}

			const data = await socialEchoApiRequest.call(this, path, body);
			returnData.push({
				json: data,
				pairedItem: { item: i },
			});
		}

		return [returnData];
	}
}
