import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  private repo = new DashboardRepository();

  async getSummary() {
    return this.repo.getSummary();
  }

  async getComplaintsByStatus() {
    return this.repo.getComplaintsByStatus();
  }

  async getComplaintsByCategory() {
    return this.repo.getComplaintsByCategory();
  }
}
