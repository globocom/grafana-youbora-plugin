import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { getBackendSrv } from '@grafana/runtime';
import _ from 'lodash';
import { Md5 } from 'ts-md5/dist/md5';
import defaults from 'lodash/defaults';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  apiUrl?: string;
  account: string;
  apiClearKey: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.apiUrl = instanceSettings.jsonData.apiUrl!;
    this.account = instanceSettings.jsonData.account!;
    this.apiClearKey = instanceSettings.jsonData.apiClearKey!;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async target => {
      const query = defaults(target, defaultQuery);
      const response = await this.request('/api/metrics', `query=${query.queryText}`);

      /**
       * In this example, the /api/metrics endpoint returns:
       *
       * {
       *   "datapoints": [
       *     {
       *       Time: 1234567891011,
       *       Value: 12.5
       *     },
       *     {
       *     ...
       *   ]
       * }
       */
      const datapoints = response.data.datapoints;

      const timestamps: number[] = [];
      const values: number[] = [];

      for (let i = 0; i < datapoints.length; i++) {
        timestamps.push(datapoints[i].Time);
        values.push(datapoints[i].Value);
      }

      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', type: FieldType.time, values: timestamps },
          { name: 'Value', type: FieldType.number, values: values },
        ],
      });
    });

    return Promise.all(promises).then(data => ({ data }));
  }

  async request(url: string, params?: string) {
    const ttl = 20 * 60 * 1000; // 20 minutes in milliseconds
    const expirationTime = new Date().getTime() + ttl; // in milliseconds

    var preUrl = `${url}?${params?.length ? `${params}` : ''}&dateToken=${expirationTime}`;
    const token = Md5.hashStr(`${preUrl}${this.apiClearKey}`);
    console.log(`DEBUG: ${preUrl}${this.apiClearKey}`);

    return getBackendSrv().datasourceRequest({
      url: `${this.apiUrl}${preUrl}&token=${token}`,
    });
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    const defaultErrorMessage = 'Error accessing API';

    try {
      const response = await this.request(`/${this.account}/data`, `fromDate=last5minutes&metrics=views`);
      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Success',
        };
      } else {
        return {
          status: 'error',
          message: response.statusText ? response.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      if (_.isString(err)) {
        return {
          status: 'error',
          message: err,
        };
      } else {
        let message = '';
        message += err.statusText ? err.statusText : defaultErrorMessage;
        if (err.data && err.data.error && err.data.error.code) {
          message += ': ' + err.data.error.code + '. ' + err.data.error.message;
        }

        return {
          status: 'error',
          message,
        };
      }
    }
  }
}
