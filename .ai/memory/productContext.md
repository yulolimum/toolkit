# Product Context: @yulolimum/scripts

## Why This Project Exists

### Problem Statement

Modern technical workflows involve repetitive tasks across multiple domains that require consistent automation:

- **Development Workflows**: Code quality maintenance, environment setup, and project cleanup across different technologies
- **Media Management**: Organizing, converting, and maintaining large media libraries with consistent metadata and structure
- **Deployment Operations**: Reliable, repeatable deployment processes across different environments and platforms
- **System Administration**: Regular maintenance, backup, and optimization tasks that need consistent execution
- **Personal Productivity**: Automating routine technical tasks to focus on higher-value work

### Pain Points Addressed

1. **Cross-Domain Inconsistency**: Different tools and approaches for similar automation needs across domains
2. **Manual Repetition**: Performing the same tasks repeatedly across development, media, deployment, and system management
3. **Context Switching**: Remembering different command patterns and procedures for different types of tasks
4. **Tool Fragmentation**: Using disparate tools that don't integrate well or follow consistent patterns
5. **Knowledge Retention**: Difficulty remembering complex command sequences and configurations across different domains

## How It Should Work

### User Experience Goals

#### Development Category (`dev-*`)
- **Interactive Selection**: Users choose which tools to run (TypeScript, ESLint, Prettier)
- **Smart Defaults**: Remember user preferences to reduce decision fatigue
- **Clear Feedback**: Immediate success/failure indication with actionable error messages
- **Flexible Targeting**: Support for running on specific files/paths or entire project
- **Environment Validation**: Comprehensive checking of development tool requirements

#### Media Management Category (`media-*`)
- **Batch Processing**: Handle large collections of media files efficiently
- **Format Flexibility**: Support multiple input/output formats with intelligent conversion
- **Metadata Preservation**: Maintain and enhance metadata during processing
- **Organization Automation**: Automatic sorting and cataloging based on configurable rules
- **Duplicate Detection**: Identify and handle duplicate files intelligently

#### Deployment Category (`deploy-*`)
- **Environment Awareness**: Understand different deployment targets and requirements
- **Rollback Capability**: Safe deployment with easy rollback mechanisms
- **Configuration Management**: Handle environment-specific configurations seamlessly
- **Progress Tracking**: Clear visibility into deployment progress and status
- **Validation Steps**: Automated verification of successful deployments

#### System Administration Category (`system-*`)
- **Safe Operations**: Never compromise system stability or data integrity
- **Comprehensive Coverage**: Handle various system maintenance tasks consistently
- **Resource Monitoring**: Track system resources and performance impact
- **Automated Scheduling**: Support for regular maintenance routines
- **Recovery Procedures**: Built-in safeguards and recovery mechanisms

#### Personal Productivity Category (`personal-*`)
- **Workflow Integration**: Seamlessly integrate with existing personal workflows
- **Data Processing**: Handle various data formats and transformation needs
- **Task Automation**: Reduce manual effort for routine personal technical tasks
- **Customization**: Flexible configuration for personal preferences and requirements

### Integration Patterns

#### Package.json Scripts
- Provide npm/pnpm script aliases for easy execution
- Follow consistent naming conventions (`category:action`)
- Enable integration with existing workflows across all domains
- Support both interactive and automated execution modes

#### Cross-Domain Usage
- Scripts should work regardless of project or file structure
- Minimal assumptions about environment configuration
- Graceful handling of missing tools or dependencies
- Consistent user experience patterns across different script categories

#### Multi-Language Coordination
- Seamless execution regardless of underlying implementation language
- Consistent parameter passing and configuration approaches
- Unified error handling and reporting across different runtimes
- Shared configuration and preference management where applicable

## Value Proposition

### For Personal Automation
- **Time Savings**: Reduce repetitive task execution across all technical domains
- **Consistency**: Same automation patterns for development, media, deployment, and system tasks
- **Reliability**: Proven, tested procedures for critical operations
- **Focus**: Spend time on creative and strategic work, not routine automation
- **Knowledge Preservation**: Codify complex procedures for reliable future execution

### For Multi-Domain Workflows
- **Unified Experience**: Consistent interface and patterns across different types of automation
- **Cross-Domain Integration**: Scripts that can work together across different domains
- **Scalable Organization**: Easy to add new automation without complexity overhead
- **Maintenance Efficiency**: Single repository and approach for all automation needs

### For Team and Collaboration
- **Standardization**: Consistent automation processes that can be shared
- **Documentation**: Self-documenting scripts with clear purpose and usage
- **Onboarding**: New team members can quickly understand and use automation tools
- **Knowledge Sharing**: Reusable patterns and approaches across different domains

## Success Metrics

### User Experience
- Scripts complete successfully on first run across all domains
- Users remember and prefer using these scripts over manual procedures
- Minimal learning curve for new script categories
- Clear, actionable feedback when issues occur
- Consistent experience across different types of automation

### Technical Performance
- Fast execution times appropriate for each domain (< 30 seconds for most operations)
- Reliable operation across different environments, file types, and domains
- Minimal resource consumption across different runtime environments
- Graceful handling of edge cases and errors across all script categories

### Adoption Indicators
- Regular usage across multiple domains and projects
- Integration into daily workflows (development, media management, deployment, system maintenance)
- Positive feedback on automation experience across different domains
- Reduced time spent on manual procedures across all technical areas
- Successful expansion to new automation categories over time
