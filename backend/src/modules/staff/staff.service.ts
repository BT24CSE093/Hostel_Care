import { StaffRepository } from './staff.repository';

export class StaffService {
  private repo = new StaffRepository();

  async getAllStaff() {
    return this.repo.findAll();
  }

  async getAssignments(staffId: number) {
    return this.repo.findAssignmentsByStaffId(staffId);
  }
}
