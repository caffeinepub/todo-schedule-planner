import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Option "mo:core/Option";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type Priority = {
    #low;
    #medium;
    #high;
  };

  public type Task = {
    id : Nat;
    title : Text;
    description : Text;
    dueDate : ?Text; // YYYY-MM-DD
    dueTime : ?Text; // HH:MM
    priority : Priority;
    completed : Bool;
    createdAt : Int;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  var nextTaskId = 1;

  let userTasks = Map.empty<Principal, Map.Map<Nat, Task>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Task management functions
  public shared ({ caller }) func createTask(title : Text, description : Text, dueDate : ?Text, dueTime : ?Text, priority : Priority) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let taskId = nextTaskId;
    nextTaskId += 1;

    let task : Task = {
      id = taskId;
      title;
      description;
      dueDate;
      dueTime;
      priority;
      completed = false;
      createdAt = Time.now();
    };

    switch (userTasks.get(caller)) {
      case (null) {
        let newTaskMap = Map.singleton<Nat, Task>(taskId, task);
        userTasks.add(caller, newTaskMap);
      };
      case (?taskMap) {
        taskMap.add(taskId, task);
      };
    };

    task;
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { [] };
      case (?taskMap) { taskMap.values().toArray().sort() };
    };
  };

  public shared ({ caller }) func updateTask(id : Nat, title : Text, description : Text, dueDate : ?Text, dueTime : ?Text, priority : Priority) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?taskMap) {
        switch (taskMap.get(id)) {
          case (null) { Runtime.trap("Task not found") };
          case (?existingTask) {
            let updatedTask : Task = {
              id = existingTask.id;
              title;
              description;
              dueDate;
              dueTime;
              priority;
              completed = existingTask.completed;
              createdAt = existingTask.createdAt;
            };
            taskMap.add(id, updatedTask);
            updatedTask;
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?taskMap) {
        switch (taskMap.get(id)) {
          case (null) { Runtime.trap("Task not found") };
          case (?_) {
            taskMap.remove(id);
          };
        };
      };
    };
  };

  public shared ({ caller }) func toggleComplete(id : Nat) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle task completion");
    };

    switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?taskMap) {
        switch (taskMap.get(id)) {
          case (null) { Runtime.trap("Task not found") };
          case (?existingTask) {
            let updatedTask : Task = {
              id = existingTask.id;
              title = existingTask.title;
              description = existingTask.description;
              dueDate = existingTask.dueDate;
              dueTime = existingTask.dueTime;
              priority = existingTask.priority;
              completed = not existingTask.completed;
              createdAt = existingTask.createdAt;
            };
            taskMap.add(id, updatedTask);
            updatedTask;
          };
        };
      };
    };
  };

  public query ({ caller }) func getTasksByDate(date : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) { [] };
      case (?taskMap) {
        let filtered = taskMap.values().filter(func(task) { task.dueDate.isSome() and task.dueDate == ?date });
        filtered.toArray().sort();
      };
    };
  };
};
