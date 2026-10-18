import { HostelsRepository } from './hostels.repository';
import { AppError } from '../../middleware/error.middleware';

export class HostelsService {
  private repo = new HostelsRepository();

  async getAllHostels() {
    return this.repo.findAllHostels();
  }

  async getRoomsByHostelId(hostelId: number) {
    const hostel = await this.repo.findHostelById(hostelId);
    if (!hostel) {
      throw new AppError('Hostel not found', 404);
    }
    return this.repo.findRoomsByHostelId(hostelId);
  }

  async getAllCategories() {
    return this.repo.findAllCategories();
  }
}
