import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { normalizeAccountIds, socialEchoApiRequest } from './GenericFunctions';

export class SocialEcho implements INodeType {
		description: INodeTypeDescription = {
		displayName: 'SocialEcho',
		name: 'socialEcho',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Call SocialEcho external APIs for team/account/article/report data',
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
						description: 'Get current team information (/v1/team)',
						action: 'Get team',
					},
					{
						name: 'List Accounts',
						value: 'listAccounts',
						description: 'List social media accounts (/v1/account)',
						action: 'List accounts',
					},
					{
						name: 'List Articles',
						value: 'listArticles',
						description: 'List post/article data (/v1/article)',
						action: 'List articles',
					},
					{
						name: 'Get Report',
						value: 'getReport',
						description: 'Get report data by date range (/v1/report)',
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
				description: 'Account type filter passed to /v1/account',
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
				description: 'Optional comma-separated account IDs',
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
				description: 'Report time granularity type',
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
				description: 'Optional report group',
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
			const query: IDataObject = {};
			let path = '/v1/team';

			if (operation === 'listAccounts') {
				path = '/v1/account';
				query.page = this.getNodeParameter('page', i) as number;
				query.type = this.getNodeParameter('type', i) as number;
			}

			if (operation === 'listArticles') {
				path = '/v1/article';
				query.page = this.getNodeParameter('page', i) as number;
				const accountIds = normalizeAccountIds(
					(this.getNodeParameter('accountIds', i, '') as string) || '',
				);
				if (accountIds) {
					query.account_ids = accountIds;
				}
			}

			if (operation === 'getReport') {
				path = '/v1/report';
				query.start_date = this.getNodeParameter('startDate', i) as string;
				query.end_date = this.getNodeParameter('endDate', i) as string;
				query.time_type = this.getNodeParameter('timeType', i) as number;
				query.group = this.getNodeParameter('group', i, '') as string;

				const accountIds = normalizeAccountIds(
					(this.getNodeParameter('accountIds', i, '') as string) || '',
				);
				if (accountIds) {
					query.account_ids = accountIds;
				}
			}

			const data = await socialEchoApiRequest.call(this, path, query);
			returnData.push({
				json: data,
				pairedItem: { item: i },
			});
		}

		return [returnData];
	}
}
