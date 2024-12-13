export interface ICourseContent {
  contentItems: IContentItem[];
  likeCount: number | null;
  dislikeCount: number | null;
  courseIdentifier: any; // Assuming course is a string array
}

export interface IContentItem extends Document {
  sectionNumber: number;
  contentDetails: IContentDetail[];
}

// Interface for Content Details
export interface IContentDetail extends Document {
    _id?: string;
  heading: string;
  summary: string;
  media: {
    mediaUrl: string;
    mediaType: 'Video' | 'PDF File';
  };
  relatedLinks: ILink[];
}

// Interface for Hyperlink
export interface ILink extends Document {
  linkTitle: string;
  linkUrl: string;
}

export interface IQuiz {
  questions: IQuestion[];
}

export interface IAssignment {
  questions: IQuestion[];
}

export interface IAssignmentQuestions {
  question: string;
}

export interface IQuestion {
  question: string;
  options?: string[]; // only needed in the quiz
  answer: string;
}
