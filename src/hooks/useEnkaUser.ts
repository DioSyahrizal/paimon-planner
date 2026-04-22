import { EnkaApiError, fetchEnkaUser } from "@/api/enka";
import type { EnkaRawResponse } from "@/api/types";
import { parseEnkaResponse } from "@/lib/enka-parser";
import type { Character } from "@/types/character";
import { useQuery } from "@tanstack/react-query";

interface EnkaUserData {
  playerInfo: EnkaRawResponse["playerInfo"];
  characters: Character[];
  ttl: number;
}

export function useEnkaUser(uid: string) {
  return useQuery<EnkaUserData, EnkaApiError>({
    queryKey: ["enka-user", uid],
    queryFn: async () => {
      const raw = await fetchEnkaUser(uid);
      return {
        playerInfo: raw.playerInfo,
        characters: parseEnkaResponse(raw.avatarInfoList ?? []),
        ttl: raw.ttl,
      };
    },
    staleTime: (query) => {
      const ttl = (query.state.data as EnkaUserData | undefined)?.ttl ?? 60;
      return ttl * 1000;
    },
    enabled: uid.length === 9,
    retry: (failureCount, error) => {
      if (error instanceof EnkaApiError && error.status === 429) return false;
      return failureCount < 3;
    },
  });
}
