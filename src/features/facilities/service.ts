import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createResourceSchema,
  createRoomSchema,
  updateResourceSchema,
  updateRoomSchema,
  type CreateResourceInput,
  type CreateRoomInput,
  type Resource,
  type Room,
  type UpdateResourceInput,
  type UpdateRoomInput,
} from "./schemas"

const DEMO_CAMPUS = "campus-demo-main"
const now = () => new Date().toISOString()

const rooms: Room[] = []
const resources: Resource[] = []

function findRoom(id: string) {
  const r = rooms.find((x) => x.id === id)
  if (!r) throw new NotFoundError("Room", id)
  return r
}

function findResource(id: string) {
  const r = resources.find((x) => x.id === id)
  if (!r) throw new NotFoundError("Resource", id)
  return r
}

export const facilitiesService = {
  async listRooms(): Promise<Room[]> {
    return [...rooms].sort((a, b) => a.name.localeCompare(b.name))
  },

  async createRoom(input: CreateRoomInput): Promise<Room> {
    const parsed = createRoomSchema.parse(input)
    const ts = now()
    const room: Room = {
      id: `room-${crypto.randomUUID()}`,
      campusId: parsed.campusId || DEMO_CAMPUS,
      name: parsed.name,
      capacity: parsed.capacity ?? null,
      locationNote: parsed.locationNote ?? "",
      requiresApproval: parsed.requiresApproval ?? false,
      isActive: parsed.isActive ?? true,
      createdAt: ts,
      updatedAt: ts,
    }
    rooms.unshift(room)
    return { ...room }
  },

  async updateRoom(id: string, input: UpdateRoomInput): Promise<Room> {
    const room = findRoom(id)
    const parsed = updateRoomSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")
    Object.assign(room, {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.campusId !== undefined && { campusId: parsed.campusId }),
      ...(parsed.capacity !== undefined && { capacity: parsed.capacity }),
      ...(parsed.locationNote !== undefined && { locationNote: parsed.locationNote }),
      ...(parsed.requiresApproval !== undefined && { requiresApproval: parsed.requiresApproval }),
      ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
      updatedAt: now(),
    })
    return { ...room }
  },

  async listResources(): Promise<Resource[]> {
    return [...resources].sort((a, b) => a.name.localeCompare(b.name))
  },

  async createResource(input: CreateResourceInput): Promise<Resource> {
    const parsed = createResourceSchema.parse(input)
    const ts = now()
    const resource: Resource = {
      id: `res-${crypto.randomUUID()}`,
      campusId: parsed.campusId || DEMO_CAMPUS,
      name: parsed.name,
      category: parsed.category ?? "equipment",
      description: parsed.description ?? "",
      quantity: parsed.quantity ?? 1,
      requiresApproval: parsed.requiresApproval ?? false,
      isActive: parsed.isActive ?? true,
      createdAt: ts,
      updatedAt: ts,
    }
    resources.unshift(resource)
    return { ...resource }
  },

  async updateResource(id: string, input: UpdateResourceInput): Promise<Resource> {
    const resource = findResource(id)
    const parsed = updateResourceSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")
    Object.assign(resource, {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.campusId !== undefined && { campusId: parsed.campusId }),
      ...(parsed.category !== undefined && { category: parsed.category }),
      ...(parsed.description !== undefined && { description: parsed.description }),
      ...(parsed.quantity !== undefined && { quantity: parsed.quantity }),
      ...(parsed.requiresApproval !== undefined && { requiresApproval: parsed.requiresApproval }),
      ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
      updatedAt: now(),
    })
    return { ...resource }
  },
}
