export interface Rating {
    id: number;
    user_id: number;
    tea_id: number;
    umami: number;
    astringency: number;
    floral: number;
    vegetal: number;
    nutty: number;
    roasted: number;
    body: number;
    rating: number;
}

export interface Tea {
    id: number;
    tea_name: string;
    provider: string;
}
  