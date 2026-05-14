
export interface TierItem {
  id: string;
  name: string;
}

export interface TierLevel {
  id: string;
  name: string;
  color: string;
  itemIds: string[];
}

export interface TierListData {
  levels: TierLevel[];
  unassignedItems: string[];
}
