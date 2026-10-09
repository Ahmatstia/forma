import { Project, ProjectAnswer } from "@/modules/projects";

export const WEB_LANDING_PROJECT: Project = {
  id: "proj_web_landing_01",
  name: "PortofolioPro",
  ideaSummary: "Website portofolio interaktif untuk memamerkan proyek open source",
  platforms: ["web"],
  complexityTrack: "quick",
  constraintsSummary: "Waktu pengerjaan 1 minggu, hosting statis gratis",
  createdAt: "2026-10-09T00:00:00Z",
  updatedAt: "2026-10-09T00:00:00Z",
};

export const WEB_LANDING_ANSWERS: ProjectAnswer[] = [
  {
    id: "ans_w1",
    projectId: "proj_web_landing_01",
    key: "product.targetUsers",
    value: "Tech recruiter dan sesama software engineer",
    valueType: "string",
    certainty: "confirmed",
    source: "user",
    updatedAt: "2026-10-09T00:00:00Z",
  },
  {
    id: "ans_w2",
    projectId: "proj_web_landing_01",
    key: "product.problem",
    value: "Format CV PDF statis membosankan dan tidak menampilkan demo proyek langsung",
    valueType: "string",
    certainty: "confirmed",
    source: "user",
    updatedAt: "2026-10-09T00:00:00Z",
  },
];
