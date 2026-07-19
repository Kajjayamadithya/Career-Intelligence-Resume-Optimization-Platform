const resourceCatalog = {
  react: {
    technology: 'React',
    officialDocs: { name: 'React Documentation', url: 'https://react.dev' },
    youtube: {
      channel: 'freeCodeCamp.org',
      title: 'React JS Full Course for Beginners',
      url: 'https://www.youtube.com/watch?v=bMknfKXIFA8'
    },
    practice: { name: 'Frontend Mentor Practice Projects', url: 'https://www.frontendmentor.io' },
    github: {
      awesome: 'https://github.com/enaqx/awesome-react',
      beginner: 'https://github.com/gitdagray/react_resources',
      advanced: 'https://github.com/alan2207/bulletproof-react'
    },
    articles: { name: 'React Beta Documentation & Guides', url: 'https://react.dev/reference/react' },
    courses: { name: 'Harvard CS50 Web Programming', url: 'https://cs50.harvard.edu/web/' }
  },
  node: {
    technology: 'Node.js / Express',
    officialDocs: { name: 'Node.js Official Documentation', url: 'https://nodejs.org/en/docs/' },
    youtube: {
      channel: 'Programming with Mosh',
      title: 'Node.js Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4'
    },
    practice: { name: 'Exercism JavaScript Track', url: 'https://exercism.org/tracks/javascript' },
    github: {
      awesome: 'https://github.com/sindresorhus/awesome-nodejs',
      beginner: 'https://github.com/workshopper/learnyounode',
      advanced: 'https://github.com/goldbergyoni/nodebestpractices'
    },
    articles: { name: 'MDN Node.js Express Tutorial', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs' },
    courses: { name: 'freeCodeCamp Node.js & Express Course', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/' }
  },
  mongodb: {
    technology: 'MongoDB',
    officialDocs: { name: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/' },
    youtube: {
      channel: 'freeCodeCamp.org',
      title: 'MongoDB Complete Tutorial',
      url: 'https://www.youtube.com/watch?v=ofme2o290Y4'
    },
    practice: { name: 'MongoDB University Labs', url: 'https://learn.mongodb.com/' },
    github: {
      awesome: 'https://github.com/ramnes/awesome-mongodb',
      beginner: 'https://github.com/mongodb/mongo',
      advanced: 'https://github.com/mongodb-developer/nodejs-quickstart'
    },
    articles: { name: 'MongoDB Official Developer Blog', url: 'https://www.mongodb.com/blog' },
    courses: { name: 'MongoDB Basics (Free Course)', url: 'https://learn.mongodb.com/learning-paths/mongodb-basics' }
  },
  docker: {
    technology: 'Docker',
    officialDocs: { name: 'Docker Documentation', url: 'https://docs.docker.com/' },
    youtube: {
      channel: 'TechWorld with Nana',
      title: 'Docker Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=3c-iKanevFo'
    },
    practice: { name: 'Play with Docker Interactive Labs', url: 'https://labs.play-with-docker.com/' },
    github: {
      awesome: 'https://github.com/veggiemonk/awesome-docker',
      beginner: 'https://github.com/docker/labs',
      advanced: 'https://github.com/wsargent/docker-cheat-sheet'
    },
    articles: { name: 'Docker Get Started Guides', url: 'https://docs.docker.com/get-started/' },
    courses: { name: 'freeCodeCamp Docker Course', url: 'https://www.freecodecamp.org/news/run-docker-locally/' }
  },
  kubernetes: {
    technology: 'Kubernetes',
    officialDocs: { name: 'Kubernetes Reference Documentation', url: 'https://kubernetes.io/docs/home/' },
    youtube: {
      channel: 'TechWorld with Nana',
      title: 'Kubernetes Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=X48VuDVv0do'
    },
    practice: { name: 'Killercoda Interactive K8s Scenarios', url: 'https://killercoda.com/' },
    github: {
      awesome: 'https://github.com/ramitsurana/awesome-kubernetes',
      beginner: 'https://github.com/kubernetes/kubernetes',
      advanced: 'https://github.com/kelseyhightower/kubernetes-the-hard-way'
    },
    articles: { name: 'Kubernetes Blog & Official Tutorials', url: 'https://kubernetes.io/blog/' },
    courses: { name: 'Udacity Scalable Microservices with Kubernetes', url: 'https://www.udacity.com/course/scalable-microservices-with-kubernetes--ud615' }
  },
  aws: {
    technology: 'AWS',
    officialDocs: { name: 'AWS Developer Documentation', url: 'https://docs.aws.amazon.com/' },
    youtube: {
      channel: 'freeCodeCamp.org',
      title: 'AWS Certified Cloud Practitioner Course',
      url: 'https://www.youtube.com/watch?v=SOTamWGuDKc'
    },
    practice: { name: 'AWS Workshop Center', url: 'https://workshops.aws/' },
    github: {
      awesome: 'https://github.com/donnemartin/awesome-aws',
      beginner: 'https://github.com/aws/aws-cli',
      advanced: 'https://github.com/aws-samples/aws-bootstrap-templates'
    },
    articles: { name: 'AWS Architecture Blog', url: 'https://aws.amazon.com/blogs/architecture/' },
    courses: { name: 'Coursera AWS Cloud Practitioner Essentials', url: 'https://www.coursera.org/learn/aws-cloud-practitioner-essentials' }
  },
  python: {
    technology: 'Python',
    officialDocs: { name: 'Python 3 Tutorial & Library Docs', url: 'https://docs.python.org/3/' },
    youtube: {
      channel: 'Programming with Mosh',
      title: 'Python Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc'
    },
    practice: { name: 'LeetCode Python Exercises', url: 'https://leetcode.com/' },
    github: {
      awesome: 'https://github.com/vinta/awesome-python',
      beginner: 'https://github.com/jakevdp/WhirlwindTourOfPython',
      advanced: 'https://github.com/faif/python-patterns'
    },
    articles: { name: 'Real Python Tutorials & Guides', url: 'https://realpython.com/' },
    courses: { name: 'Harvard CS50 Introduction to Programming with Python', url: 'https://cs50.harvard.edu/python/' }
  },
  ml: {
    technology: 'Machine Learning / Data Science',
    officialDocs: { name: 'Scikit-Learn Documentation', url: 'https://scikit-learn.org/stable/' },
    youtube: {
      channel: 'freeCodeCamp.org',
      title: 'Machine Learning Course for Beginners',
      url: 'https://www.youtube.com/watch?v=NWONeJKn6kc'
    },
    practice: { name: 'Kaggle Machine Learning Competitions', url: 'https://www.kaggle.com/' },
    github: {
      awesome: 'https://github.com/josephmisiti/awesome-machine-learning',
      beginner: 'https://github.com/ageron/handson-ml3',
      advanced: 'https://github.com/scikit-learn/scikit-learn'
    },
    articles: { name: 'Towards Data Science Publication', url: 'https://towardsdatascience.com/' },
    courses: { name: 'DeepLearning.AI Machine Learning Specialization', url: 'https://www.deeplearning.ai/' }
  },
  sql: {
    technology: 'SQL / Databases',
    officialDocs: { name: 'PostgreSQL Manual', url: 'https://www.postgresql.org/docs/' },
    youtube: {
      channel: 'Traversy Media',
      title: 'SQL Databases for Beginners',
      url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY'
    },
    practice: { name: 'HackerRank SQL Challenges', url: 'https://www.hackerrank.com/domains/sql' },
    github: {
      awesome: 'https://github.com/numetriclabz/awesome-db',
      beginner: 'https://github.com/major/sql-cheat-sheet',
      advanced: 'https://github.com/karanpratapsingh/system-design'
    },
    articles: { name: 'Use The Index, Luke (SQL Indexing Guide)', url: 'https://use-the-index-luke.com/' },
    courses: { name: 'freeCodeCamp SQL Database Design Course', url: 'https://www.youtube.com/watch?v=ztHopE5Wubs' }
  },
  git: {
    technology: 'Git / GitHub',
    officialDocs: { name: 'Git Reference Manual', url: 'https://git-scm.com/docs' },
    youtube: {
      channel: 'Fireship',
      title: 'Git & GitHub Tutorial in 10 Minutes',
      url: 'https://www.youtube.com/watch?v=hwP7WQhECEc'
    },
    practice: { name: 'Learn Git Branching Sandbox', url: 'https://learngitbranching.js.org/' },
    github: {
      awesome: 'https://github.com/dictcp/awesome-git',
      beginner: 'https://github.com/jlord/git-it-electron',
      advanced: 'https://github.com/k88hudson/git-flight-rules'
    },
    articles: { name: 'Atlassian Git Tutorials', url: 'https://www.atlassian.com/git/tutorials' },
    courses: { name: 'GitHub Skills Interactive Training', url: 'https://skills.github.com/' }
  }
};

class ResourceService {
  /**
   * Scans a topic string and matches it against our technology vocabulary,
   * returning associated verified URLs.
   * @param {string} topic - Learning topic string
   * @param {Array<string>} objectives - Learning objectives array
   * @returns {Object} Structured resources object
   */
  enrichWeeklyTopic(topic, objectives = []) {
    const searchText = `${topic} ${objectives.join(' ')}`.toLowerCase();
    
    // Default fallback resources if no match is found
    let matchedResources = {
      technology: 'General Software Engineering',
      officialDocs: { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
      youtube: {
        channel: 'freeCodeCamp.org',
        title: 'Software Engineering Career Guide',
        url: 'https://www.youtube.com/watch?v=zOJbT15G0i4'
      },
      practice: { name: 'LeetCode Coding Sandbox', url: 'https://leetcode.com/' },
      github: {
        awesome: 'https://github.com/kamranahmedse/developer-roadmap',
        beginner: 'https://github.com/jwasham/coding-interview-university',
        advanced: 'https://github.com/donnemartin/system-design-primer'
      },
      articles: { name: 'freeCodeCamp Technical Articles', url: 'https://www.freecodecamp.org/news/' },
      courses: { name: 'Harvard CS50 Introduction to Computer Science', url: 'https://cs50.harvard.edu/x/' }
    };

    // Scan the catalog for matches
    for (const key in resourceCatalog) {
      // Direct substring search
      if (searchText.includes(key) || (key === 'node' && searchText.includes('express')) || (key === 'ml' && (searchText.includes('machine learning') || searchText.includes('data science') || searchText.includes('nlp')))) {
        matchedResources = resourceCatalog[key];
        break;
      }
    }

    return matchedResources;
  }
}

module.exports = new ResourceService();
