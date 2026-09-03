import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

import { getHostelStructure, saveBuilding, saveFloor, saveRoom } from "@/lib/foundation.functions";
import { getBedOccupants } from "@/lib/modules.functions";
import { RoomCard } from "@/components/hostel/room-board";
import { useSession } from "@/hooks/use-session";
import { can } from "@/lib/permissions";

import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/hostels/$hostelId")({
  head: () => ({
    meta: [
      { title: "Hostel detail | VISTARX Hostel360" },
      {
        name: "description",
        content: "Drill into a hostel's buildings, floors, rooms and live bed availability.",
      },
      { property: "og:title", content: "Hostel detail | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Drill into a hostel's buildings, floors, rooms and live bed availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HostelDetailPage,
});

function HostelDetailPage() {
  const { hostelId } = Route.useParams();
  const { roles } = useSession();
  const queryClient = useQueryClient();
  const fetchStructure = useServerFn(getHostelStructure);
  const addBuilding = useServerFn(saveBuilding);
  const addFloor = useServerFn(saveFloor);
  const addRoom = useServerFn(saveRoom);

  const [dialog, setDialog] = useState<"building" | "floor" | "room" | null>(null);
  const [buildingName, setBuildingName] = useState("");
  const [floor, setFloor] = useState({ building_id: "", name: "", level: "0" });
  const [room, setRoom] = useState({ floor_id: "", room_number: "", capacity: "4" });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["hostel-structure", hostelId],
    queryFn: () => fetchStructure({ data: { hostelId } }),
  });

  const fetchOccupants = useServerFn(getBedOccupants);
  const { data: occupancy } = useQuery({
    queryKey: ["hostel-detail", "occupants", hostelId],
    queryFn: () => fetchOccupants({ data: { hostelId } }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["hostel-structure", hostelId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["hostels"] });
    queryClient.invalidateQueries({ queryKey: ["hostel-detail"] });
    queryClient.invalidateQueries({ queryKey: ["available-beds"] });
  };

  const buildingMutation = useMutation({
    mutationFn: () =>
      addBuilding({
        data: {
          hostel_id: hostelId,
          branch_id: data!.hostel.branch_id,
          name: buildingName,
        },
      }),
    onSuccess: () => {
      toast.success("Building added");
      setBuildingName("");
      setDialog(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const floorMutation = useMutation({
    mutationFn: () =>
      addFloor({
        data: {
          building_id: floor.building_id,
          branch_id: data!.hostel.branch_id,
          name: floor.name,
          level: Number(floor.level),
        },
      }),
    onSuccess: () => {
      toast.success("Floor added");
      setFloor({ building_id: "", name: "", level: "0" });
      setDialog(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roomMutation = useMutation({
    mutationFn: () =>
      addRoom({
        data: {
          floor_id: room.floor_id,
          hostel_id: hostelId,
          branch_id: data!.hostel.branch_id,
          room_number: room.room_number,
          capacity: Number(room.capacity),
          generate_beds: true,
        },
      }),
    onSuccess: () => {
      toast.success("Room and beds created");
      setRoom({ floor_id: "", room_number: "", capacity: "4" });
      setDialog(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!data)
    return (
      <EmptyState
        title="Hostel not found"
        description="It may have been removed or you lack access."
      />
    );

  const editable = can(roles, "hostels", "edit");
  const occupied = data.beds.filter((b) => b.status === "occupied").length;

  return (
    <>
      <Link
        to="/hostels"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All hostels
      </Link>

      <PageHeader
        title={data.hostel.name}
        description={`${data.hostel.code} · ${data.hostel.type} hostel`}
        actions={
          editable ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setDialog("building")}>
                <Plus className="mr-1.5 h-4 w-4" /> Building
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={data.buildings.length === 0}
                onClick={() => setDialog("floor")}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Floor
              </Button>
              <Button
                size="sm"
                disabled={data.floors.length === 0}
                onClick={() => setDialog("room")}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Room
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Buildings" value={data.buildings.length} />
        <StatCard label="Floors" value={data.floors.length} />
        <StatCard label="Rooms" value={data.rooms.length} />
        <StatCard label="Beds occupied" value={`${occupied} / ${data.beds.length}`} tone="accent" />
      </div>

      {data.buildings.length === 0 ? (
        <EmptyState
          title="No structure yet"
          description="Add a building, then floors, then rooms. Beds are generated automatically from room capacity."
          action={
            editable ? (
              <Button onClick={() => setDialog("building")}>Add building</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {data.buildings.map((building) => {
            const floors = data.floors.filter((f) => f.building_id === building.id);
            return (
              <section key={building.id} className="rounded-lg border border-border bg-card">
                <header className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold">{building.name}</h2>
                </header>
                {floors.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted-foreground">No floors added yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {floors.map((f) => {
                      const rooms = data.rooms.filter((r) => r.floor_id === f.id);
                      return (
                        <div key={f.id} className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{f.name}</p>
                            <Badge variant="outline" className="text-[10px]">
                              Level {f.level}
                            </Badge>
                          </div>
                          {rooms.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">No rooms yet.</p>
                          ) : (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {rooms.map((r) => (
                                <RoomCard
                                  key={r.id}
                                  room={r}
                                  beds={data.beds.filter((b) => b.room_id === r.id)}
                                  occupants={(occupancy?.occupants ?? []).filter(
                                    (o) => o.roomId === r.id,
                                  )}
                                  branchId={data.hostel.branch_id}
                                  editable={editable}
                                  onChanged={invalidate}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={dialog === "building"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add building</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="building-name">Building name</Label>
            <Input
              id="building-name"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={!buildingName || buildingMutation.isPending}
              onClick={() => buildingMutation.mutate()}
            >
              Add building
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "floor"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add floor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Building</Label>
              <Select
                value={floor.building_id}
                onValueChange={(v) => setFloor((f) => ({ ...f, building_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {data.buildings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor-name">Floor name</Label>
                <Input
                  id="floor-name"
                  value={floor.name}
                  onChange={(e) => setFloor((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor-level">Level</Label>
                <Input
                  id="floor-level"
                  type="number"
                  value={floor.level}
                  onChange={(e) => setFloor((f) => ({ ...f, level: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!floor.building_id || !floor.name || floorMutation.isPending}
              onClick={() => floorMutation.mutate()}
            >
              Add floor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "room"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Floor</Label>
              <Select
                value={room.floor_id}
                onValueChange={(v) => setRoom((r) => ({ ...r, floor_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  {data.floors.map((f) => {
                    const b = data.buildings.find((x) => x.id === f.building_id);
                    return (
                      <SelectItem key={f.id} value={f.id}>
                        {b?.name} · {f.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-number">Room number</Label>
                <Input
                  id="room-number"
                  value={room.room_number}
                  onChange={(e) => setRoom((r) => ({ ...r, room_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Beds</Label>
                <Input
                  id="room-capacity"
                  type="number"
                  min={1}
                  max={50}
                  value={room.capacity}
                  onChange={(e) => setRoom((r) => ({ ...r, capacity: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Beds are created automatically and numbered from the room number.
            </p>
          </div>
          <DialogFooter>
            <Button
              disabled={!room.floor_id || !room.room_number || roomMutation.isPending}
              onClick={() => roomMutation.mutate()}
            >
              Create room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
