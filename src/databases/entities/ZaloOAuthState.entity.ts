import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('zalo_oauth_states')
export class ZaloOAuthState {
  @PrimaryColumn()
  state: string;

  @Column({ type: 'text' })
  code_verifier: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ 
    type: 'timestamp',
    default: () => 'DATE_ADD(NOW(), INTERVAL 10 MINUTE)'
  })
  expires_at: Date;
}
