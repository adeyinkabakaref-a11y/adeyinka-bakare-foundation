import {
  anyPublishedExecutive,
  createExecutive,
  deleteExecutive,
  findAllExecutives,
  findExecutiveById,
  findPublishedExecutives,
  updateExecutive,
} from "../repositories/executives.repository";
import type { ExecutiveInsert, ExecutiveUpdate } from "../types/database.types";

export async function getAllExecutives() {
  return findAllExecutives();
}

export async function getPublishedExecutives() {
  return findPublishedExecutives();
}

/** The showcase on Home and About: featured executives only, in display order. */
export async function getFeaturedExecutives() {
  const published = await findPublishedExecutives();
  return published.filter((executive) => executive.featured);
}

/** True when at least one executive is published. If false, no page on the site links to /executives. */
export async function hasPublishedExecutives() {
  try {
    return await anyPublishedExecutive();
  } catch (error) {
    console.error("Error checking for published executives:", error);
    return false;
  }
}

export async function getExecutiveById(id: string) {
  return findExecutiveById(id);
}

export async function createNewExecutive(data: ExecutiveInsert) {
  return createExecutive(data);
}

export async function updateExecutiveById(id: string, data: ExecutiveUpdate) {
  return updateExecutive(id, data);
}

export async function removeExecutive(id: string) {
  return deleteExecutive(id);
}
