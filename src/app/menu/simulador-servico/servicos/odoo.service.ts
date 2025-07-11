import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OdooApiService {
  private sessionId: string = '';

  private readonly odooUrl = 'https://smsuporte-test17-20589265.dev.odoo.com';
  private readonly odooDb = 'smsuporte-test17-20589265';
  private readonly odooUser = 'vendas@projectomaquinas.com.br';
  private readonly odooApiKey = '0fd5b24912563ef77f9cc971abbe644ee42d56b1'; // Substitua pela sua chave de API

  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.odooApiKey}`,
  });

  constructor(private http: HttpClient) {}

  async login(): Promise<boolean> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: this.odooDb,
        login: this.odooUser,
        password: this.odooApiKey, // Utiliza a chave de API como senha
      },
      id: new Date().getTime(),
    };

    try {
      const response: any = await this.http
        .post(`${this.odooUrl}/web/session/authenticate`, payload, {
          headers: this.headers,
          withCredentials: true,
        })
        .toPromise();

      if (response?.result?.uid) {
        this.sessionId = response.result.session_id;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Falha no login:', error);
      return false;
    }
  }

  async fetchModelFields(model: string): Promise<any> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model,
        method: 'fields_get',
        args: [],
        kwargs: {
          attributes: ['string', 'type', 'required'],
        },
      },
      id: new Date().getTime(),
    };

    try {
      const response: any = await this.http
        .post(`${this.odooUrl}/web/dataset/call_kw`, payload, {
          headers: this.headers,
          withCredentials: true,
        })
        .toPromise();

      return response?.result || {};
    } catch (error) {
      console.error(`Erro ao obter campos do modelo ${model}:`, error);
      return {};
    }
  }

  async fetchModelData(model: string, fields: string[]): Promise<any[]> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model,
        method: 'search_read',
        args: [],
        kwargs: {
          fields,
          limit: 1000,
          offset: 0,
        },
      },
      id: new Date().getTime(),
    };

    let allRecords: any[] = [];
    let totalFetched = 0;

    try {
      while (true) {
        const response: any = await this.http
          .post(`${this.odooUrl}/web/dataset/call_kw`, payload, {
            headers: this.headers,
            withCredentials: true,
          })
          .toPromise();

        const records = response?.result || [];
        if (!records.length) break;

        allRecords = [...allRecords, ...records];
        totalFetched += records.length;
        payload.params.kwargs.offset = totalFetched;
      }
    } catch (error) {
      console.error(`Erro ao buscar dados do modelo ${model}:`, error);
    }

    return allRecords;
  }

  async createRecord(model: string, data: any): Promise<any> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model,
        method: 'create',
        args: [data],
        kwargs: {},
      },
      id: new Date().getTime(),
    };

    try {
      const response: any = await this.http
        .post(`${this.odooUrl}/web/dataset/call_kw`, payload, {
          headers: this.headers,
          withCredentials: true,
        })
        .toPromise();

      return response?.result || null;
    } catch (error) {
      console.error(`Erro ao criar registro no modelo ${model}:`, error);
      return null;
    }
  }
}
