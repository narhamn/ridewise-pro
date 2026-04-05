import { BaseRepository } from './BaseRepository';
import { Ticket, TicketStatus, TicketComment, TicketHistory } from '@/types/shuttle';
import { supabase } from '@/lib/supabase';

export class TicketRepository extends BaseRepository<Ticket> {
  constructor() {
    super('tickets');
  }

  async getByReporter(reporterId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, comments:ticket_comments(*), history:ticket_history(*)')
      .eq('reporter_id', reporterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Ticket[];
  }

  async addComment(comment: Omit<TicketComment, 'id' | 'timestamp'>): Promise<TicketComment> {
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data as TicketComment;
  }

  async updateStatus(ticketId: string, status: TicketStatus, changedByName: string, note?: string): Promise<void> {
    const { error: updateError } = await supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    const { error: historyError } = await supabase
      .from('ticket_history')
      .insert({
        ticket_id: ticketId,
        status,
        changed_by_name: changedByName,
        note
      });

    if (historyError) throw historyError;
  }
}

export const ticketRepository = new TicketRepository();
