import type { TimelineItem } from "../components/features/timeline/types";

export const timelineData: TimelineItem[] = [
  {
    id: "current-study",
    title: "Studying Cartography and Geographic Information System",
    description:
      "Currently studying Cartography and Geographic Information System, focusing on climate change and the adaptation of agriculture.",
    type: "education",
    startDate: "2024-09-01",
    location: "Beijing",
    organization:
      "Institute of the Environment and Sustainable Development in Agriculture, Chinese Academy of Agriculture Sciences",
    skills: ["LLM", "Python", "R", "Meta-analysis", "MySQL"],
    achievements: [
      "Current GPA: 3.7/4.0",
      "Completed data structures and algorithms course project",
      "Participated in multiple course project developments",
    ],
    icon: "material-symbols:school",
    color: "#059669",
    featured: true,
  },
  {
    id: "mizuki-blog-project",
    title: "Mizuki Personal Blog Project",
    description:
      "A personal blog website developed using the Astro framework as a practical project for learning frontend technologies.",
    type: "project",
    startDate: "2024-06-01",
    endDate: "2024-08-01",
    skills: ["Astro", "TypeScript", "Tailwind CSS", "Git"],
    achievements: [
      "Mastered modern frontend development tech stack",
      "Learned responsive design and user experience optimization",
      "Completed the full process from design to deployment",
    ],
    links: [
      {
        name: "GitHub Repository",
        url: "https://github.com/example/mizuki-blog",
        type: "project",
      },
      {
        name: "Live Demo",
        url: "https://mizuki-demo.example.com",
        type: "website",
      },
    ],
    icon: "material-symbols:code",
    color: "#7C3AED",
    featured: true,
  },
  {
    id: "undergraduate-study",
    title: "Studyed Geograpic information science",
    description:
      "Participated in a programming contest held by the university, improving algorithm and programming skills.",
    type: "education",
    startDate: "2020-09-01",
    endDate: "2024-06-20",
    location: "Wuhan",
    organization: "Wuhan University of Technology",
    skills: ["ArcGIS", "Python", "Algorithms", "Data Structures"],
    achievements: [
      "GPA: 3.9/5.0",
      "Completed data structures and algorithms course project",
      "Participated in multiple course project developments",
    ],
    icon: "material-symbols:school",
    color: "#059669",
  },
  {
    id: "part-time-tutor",
    title: "Part-time Physics Tutor",
    description: "Provided Physics tutoring for junior high school students.",
    type: "work",
    startDate: "2021-05-01",
    endDate: "2021-06-20",
    position: "Physics Tutor",
    skills: ["Python", "Teaching", "Communication"],
    achievements: [
      "Helped 1 student pass exams",
      "Improved expression and communication skills",
      "Gained teaching experience",
    ],
    icon: "material-symbols:school",
    color: "#059669",
  },
  {
    id: "high-school-graduation",
    title: "High School Graduation",
    description:
      "Graduated from high school with excellent grades and was admitted to the Engnieering Mechanism program at Wuhan University of Technology.",
    type: "education",
    startDate: "2017-09-01",
    endDate: "2020-07-08",
    location: "Shiyan, Hubei",
    organization: "Yunyang High School",
    achievements: [
      "College entrance exam score: 615",
      "Received municipal model student award",
      "Won provincial second prize in chemistry competition",
    ],
    icon: "material-symbols:school",
    color: "#2563EB",
  },
];
