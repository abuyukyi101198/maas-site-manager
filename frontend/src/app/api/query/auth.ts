import type { Options } from "@hey-api/client-axios";
import { useMutation } from "@tanstack/react-query";

import type { PostV1LoginPostData } from "@/app/apiclient";
import { postV1LoginPostMutation } from "@/app/apiclient/@tanstack/react-query.gen";

export const useLogin = (mutationOptions?: Options<PostV1LoginPostData>) => {
  return useMutation({
    ...postV1LoginPostMutation(mutationOptions),
  });
};
